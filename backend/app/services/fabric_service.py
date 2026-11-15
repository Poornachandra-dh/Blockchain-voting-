"""
AegisVote Hyperledger Fabric Integration Service
Executes transactions and queries against the 3-Organization Consortium Network
using the configured Aegis CLI and Endorsement Policies.
"""

import json
import logging
import subprocess
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class FabricService:
    def __init__(self, cli_container: str = "aegis_cli"):
        self.cli_container = cli_container
        self.channel_name = "votingchannel"
        self.chaincode_name = "voting_cc"
        self.orderer_ca = "/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/aegis.election/orderers/orderer.aegis.election/tls/ca.crt"
        self.peer1_tls = "/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.ec.gov/peers/peer0.org1.ec.gov/tls/ca.crt"
        self.peer2_tls = "/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.observer.org/peers/peer0.org2.observer.org/tls/ca.crt"

    def is_network_online(self) -> bool:
        """Check if aegis_cli container is running and healthy."""
        try:
            res = subprocess.run(
                ["docker", "inspect", "-f", "{{.State.Running}}", self.cli_container],
                capture_output=True,
                text=True,
                timeout=5
            )
            return res.stdout.strip() == "true"
        except Exception as e:
            logger.warning(f"Fabric network health check failed: {e}")
            return False

    def init_election(self, election_id: str, title: str, candidates: list, pub_key_n: str, pub_key_g: str) -> Dict[str, Any]:
        """Initialize an election on the Fabric ledger with 2-of-3 endorsement."""
        args_json = json.dumps([election_id, title, json.dumps(candidates), pub_key_n, pub_key_g])
        cmd = [
            "docker", "exec", self.cli_container,
            "peer", "chaincode", "invoke",
            "-o", "orderer.aegis.election:7050",
            "--ordererTLSHostnameOverride", "orderer.aegis.election",
            "--tls", "--cafile", self.orderer_ca,
            "-C", self.channel_name,
            "-n", self.chaincode_name,
            "--peerAddresses", "peer0.org1.ec.gov:7051", "--tlsRootCertFiles", self.peer1_tls,
            "--peerAddresses", "peer0.org2.observer.org:8051", "--tlsRootCertFiles", self.peer2_tls,
            "-c", json.dumps({"function": "InitElection", "Args": [election_id, title, json.dumps(candidates), pub_key_n, pub_key_g]})
        ]
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        if res.returncode != 0:
            raise RuntimeError(f"Fabric InitElection Failed: {res.stderr}")
        return {"status": "SUCCESS", "election_id": election_id}

    def cast_ballot(self, election_id: str, nullifier: str, encrypted_vector_json: str, zkp_proof_json: str, timestamp: str) -> Dict[str, Any]:
        """
        Submits ballot to Org1 and Org2 peers for 2-of-3 endorsement.
        Enforces double-voting check in smart contract.
        """
        cmd = [
            "docker", "exec", self.cli_container,
            "peer", "chaincode", "invoke",
            "-o", "orderer.aegis.election:7050",
            "--ordererTLSHostnameOverride", "orderer.aegis.election",
            "--tls", "--cafile", self.orderer_ca,
            "-C", self.channel_name,
            "-n", self.chaincode_name,
            "--peerAddresses", "peer0.org1.ec.gov:7051", "--tlsRootCertFiles", self.peer1_tls,
            "--peerAddresses", "peer0.org2.observer.org:8051", "--tlsRootCertFiles", self.peer2_tls,
            "-c", json.dumps({
                "function": "CastBallot",
                "Args": [election_id, nullifier, encrypted_vector_json, zkp_proof_json, timestamp]
            })
        ]
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        if res.returncode != 0:
            err_msg = res.stderr or res.stdout
            if "DOUBLE_VOTING_ERROR" in err_msg:
                raise ValueError(f"Fabric Consensus Rejection: Double voting detected! Nullifier '{nullifier}' already spent.")
            raise RuntimeError(f"Fabric CastBallot invocation failed: {err_msg}")
        return {"status": "COMMITTED", "nullifier": nullifier}

    def query_election(self, election_id: str) -> Optional[Dict[str, Any]]:
        """Queries election metadata from the world state."""
        cmd = [
            "docker", "exec", self.cli_container,
            "peer", "chaincode", "query",
            "-C", self.channel_name,
            "-n", self.chaincode_name,
            "-c", json.dumps({"function": "QueryElection", "Args": [election_id]})
        ]
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if res.returncode != 0:
            return None
        try:
            return json.loads(res.stdout)
        except json.JSONDecodeError:
            return None


fabric_service = FabricService()

