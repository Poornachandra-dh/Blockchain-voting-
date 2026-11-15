#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NETWORK_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "=== Cleaning previous artifacts ==="
rm -rf "${NETWORK_DIR}/crypto-config/ordererOrganizations"
rm -rf "${NETWORK_DIR}/crypto-config/peerOrganizations"
rm -rf "${NETWORK_DIR}/channel-artifacts/*"

echo "=== Step 1: Generating Crypto Material (cryptogen) ==="
docker run --rm \
  -v "${NETWORK_DIR}":/workspace \
  -w /workspace \
  hyperledger/fabric-tools:2.5 \
  cryptogen generate --config=/workspace/crypto-config.yaml --output=/workspace/crypto-config

# Ensure admincerts are populated in MSPs for explicit admin recognition
for org in org1.ec.gov org2.observer.org org3.civilsociety.ngo; do
  mkdir -p "${NETWORK_DIR}/crypto-config/peerOrganizations/${org}/msp/admincerts"
  mkdir -p "${NETWORK_DIR}/crypto-config/peerOrganizations/${org}/users/Admin@${org}/msp/admincerts"
  cp "${NETWORK_DIR}/crypto-config/peerOrganizations/${org}/users/Admin@${org}/msp/signcerts/"* "${NETWORK_DIR}/crypto-config/peerOrganizations/${org}/msp/admincerts/" 2>/dev/null || true
  cp "${NETWORK_DIR}/crypto-config/peerOrganizations/${org}/users/Admin@${org}/msp/signcerts/"* "${NETWORK_DIR}/crypto-config/peerOrganizations/${org}/users/Admin@${org}/msp/admincerts/" 2>/dev/null || true
done

mkdir -p "${NETWORK_DIR}/crypto-config/ordererOrganizations/aegis.election/msp/admincerts"
mkdir -p "${NETWORK_DIR}/crypto-config/ordererOrganizations/aegis.election/users/Admin@aegis.election/msp/admincerts"
cp "${NETWORK_DIR}/crypto-config/ordererOrganizations/aegis.election/users/Admin@aegis.election/msp/signcerts/"* "${NETWORK_DIR}/crypto-config/ordererOrganizations/aegis.election/msp/admincerts/" 2>/dev/null || true
cp "${NETWORK_DIR}/crypto-config/ordererOrganizations/aegis.election/users/Admin@aegis.election/msp/signcerts/"* "${NETWORK_DIR}/crypto-config/ordererOrganizations/aegis.election/users/Admin@aegis.election/msp/admincerts/" 2>/dev/null || true

echo "=== Step 2: Generating System Channel Genesis Block ==="
docker run --rm \
  -v "${NETWORK_DIR}":/workspace \
  -w /workspace \
  -e FABRIC_CFG_PATH=/workspace \
  hyperledger/fabric-tools:2.5 \
  configtxgen -profile ThreeOrgOrdererGenesis -channelID system-channel -outputBlock /workspace/channel-artifacts/genesis.block

echo "=== Step 3: Generating Application Channel Tx (votingchannel) ==="
docker run --rm \
  -v "${NETWORK_DIR}":/workspace \
  -w /workspace \
  -e FABRIC_CFG_PATH=/workspace \
  hyperledger/fabric-tools:2.5 \
  configtxgen -profile ThreeOrgVotingChannel -channelID votingchannel -outputCreateChannelTx /workspace/channel-artifacts/votingchannel.tx

echo "=== Channel Artifacts Generated Successfully! ==="
