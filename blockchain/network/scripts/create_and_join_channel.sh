#!/bin/bash
set -e

ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/aegis.election/orderers/orderer.aegis.election/tls/ca.crt
CHANNEL_NAME="votingchannel"

echo "=== Step 1: Creating Channel: ${CHANNEL_NAME} ==="
# Set Org1 Admin environment
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.ec.gov/peers/peer0.org1.ec.gov/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.ec.gov/users/Admin@org1.ec.gov/msp
export CORE_PEER_ADDRESS=peer0.org1.ec.gov:7051

peer channel create \
  -o orderer.aegis.election:7050 \
  -c ${CHANNEL_NAME} \
  -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/votingchannel.tx \
  --outputBlock /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/${CHANNEL_NAME}.block \
  --tls \
  --cafile ${ORDERER_CA}

echo "=== Step 2: Joining Org1 Peer to ${CHANNEL_NAME} ==="
peer channel join -b /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/${CHANNEL_NAME}.block

echo "=== Step 3: Joining Org2 Peer to ${CHANNEL_NAME} ==="
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.observer.org/peers/peer0.org2.observer.org/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.observer.org/users/Admin@org2.observer.org/msp
export CORE_PEER_ADDRESS=peer0.org2.observer.org:8051

peer channel join -b /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/${CHANNEL_NAME}.block

echo "=== Step 4: Joining Org3 Peer to ${CHANNEL_NAME} ==="
export CORE_PEER_LOCALMSPID="Org3MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.civilsociety.ngo/peers/peer0.org3.civilsociety.ngo/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.civilsociety.ngo/users/Admin@org3.civilsociety.ngo/msp
export CORE_PEER_ADDRESS=peer0.org3.civilsociety.ngo:9051

peer channel join -b /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/${CHANNEL_NAME}.block

echo "=== All 3 Organization Peers Successfully Joined ${CHANNEL_NAME}! ==="

