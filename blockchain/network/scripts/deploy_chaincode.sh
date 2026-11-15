#!/bin/bash
set -e

ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/aegis.election/orderers/orderer.aegis.election/tls/ca.crt
CHANNEL_NAME="votingchannel"
CC_NAME="voting_cc"
CC_VERSION="1.0"
CC_SEQUENCE=1
CC_SRC_PATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode/voting"

echo "=== Step 1: Packaging Chaincode ==="
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.ec.gov/peers/peer0.org1.ec.gov/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.ec.gov/users/Admin@org1.ec.gov/msp
export CORE_PEER_ADDRESS=peer0.org1.ec.gov:7051

peer lifecycle chaincode package ${CC_NAME}.tar.gz \
  --path ${CC_SRC_PATH} \
  --lang golang \
  --label ${CC_NAME}_${CC_VERSION}

echo "=== Step 2: Installing Chaincode on Org1 ==="
peer lifecycle chaincode install ${CC_NAME}.tar.gz

echo "=== Step 3: Installing Chaincode on Org2 ==="
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.observer.org/peers/peer0.org2.observer.org/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.observer.org/users/Admin@org2.observer.org/msp
export CORE_PEER_ADDRESS=peer0.org2.observer.org:8051
peer lifecycle chaincode install ${CC_NAME}.tar.gz

echo "=== Step 4: Installing Chaincode on Org3 ==="
export CORE_PEER_LOCALMSPID="Org3MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.civilsociety.ngo/peers/peer0.org3.civilsociety.ngo/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.civilsociety.ngo/users/Admin@org3.civilsociety.ngo/msp
export CORE_PEER_ADDRESS=peer0.org3.civilsociety.ngo:9051
peer lifecycle chaincode install ${CC_NAME}.tar.gz

echo "=== Step 5: Querying Package ID ==="
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.ec.gov/peers/peer0.org1.ec.gov/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.ec.gov/users/Admin@org1.ec.gov/msp
export CORE_PEER_ADDRESS=peer0.org1.ec.gov:7051

peer lifecycle chaincode queryinstalled > installed.txt
cat installed.txt
PACKAGE_ID=$(sed -n "/${CC_NAME}_${CC_VERSION}/{s/^Package ID: //; s/, Label:.*$//; p;}" installed.txt)
echo "Resolved Package ID: ${PACKAGE_ID}"

ENDORSEMENT_POLICY="OutOf(2, 'Org1MSP.member', 'Org2MSP.member', 'Org3MSP.member')"

echo "=== Step 6: Approving Chaincode for Org1 ==="
peer lifecycle chaincode approveformyorg \
  -o orderer.aegis.election:7050 \
  --ordererTLSHostnameOverride orderer.aegis.election \
  --tls \
  --cafile ${ORDERER_CA} \
  --channelID ${CHANNEL_NAME} \
  --name ${CC_NAME} \
  --version ${CC_VERSION} \
  --package-id ${PACKAGE_ID} \
  --sequence ${CC_SEQUENCE} \
  --signature-policy "${ENDORSEMENT_POLICY}"

echo "=== Step 7: Approving Chaincode for Org2 ==="
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.observer.org/peers/peer0.org2.observer.org/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.observer.org/users/Admin@org2.observer.org/msp
export CORE_PEER_ADDRESS=peer0.org2.observer.org:8051

peer lifecycle chaincode approveformyorg \
  -o orderer.aegis.election:7050 \
  --ordererTLSHostnameOverride orderer.aegis.election \
  --tls \
  --cafile ${ORDERER_CA} \
  --channelID ${CHANNEL_NAME} \
  --name ${CC_NAME} \
  --version ${CC_VERSION} \
  --package-id ${PACKAGE_ID} \
  --sequence ${CC_SEQUENCE} \
  --signature-policy "${ENDORSEMENT_POLICY}"

echo "=== Step 8: Approving Chaincode for Org3 ==="
export CORE_PEER_LOCALMSPID="Org3MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.civilsociety.ngo/peers/peer0.org3.civilsociety.ngo/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.civilsociety.ngo/users/Admin@org3.civilsociety.ngo/msp
export CORE_PEER_ADDRESS=peer0.org3.civilsociety.ngo:9051

peer lifecycle chaincode approveformyorg \
  -o orderer.aegis.election:7050 \
  --ordererTLSHostnameOverride orderer.aegis.election \
  --tls \
  --cafile ${ORDERER_CA} \
  --channelID ${CHANNEL_NAME} \
  --name ${CC_NAME} \
  --version ${CC_VERSION} \
  --package-id ${PACKAGE_ID} \
  --sequence ${CC_SEQUENCE} \
  --signature-policy "${ENDORSEMENT_POLICY}"

echo "=== Step 9: Committing Chaincode Definition on ${CHANNEL_NAME} ==="
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.ec.gov/peers/peer0.org1.ec.gov/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.ec.gov/users/Admin@org1.ec.gov/msp
export CORE_PEER_ADDRESS=peer0.org1.ec.gov:7051

peer lifecycle chaincode commit \
  -o orderer.aegis.election:7050 \
  --ordererTLSHostnameOverride orderer.aegis.election \
  --tls \
  --cafile ${ORDERER_CA} \
  --channelID ${CHANNEL_NAME} \
  --name ${CC_NAME} \
  --version ${CC_VERSION} \
  --sequence ${CC_SEQUENCE} \
  --signature-policy "${ENDORSEMENT_POLICY}" \
  --peerAddresses peer0.org1.ec.gov:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.ec.gov/peers/peer0.org1.ec.gov/tls/ca.crt \
  --peerAddresses peer0.org2.observer.org:8051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.observer.org/peers/peer0.org2.observer.org/tls/ca.crt \
  --peerAddresses peer0.org3.civilsociety.ngo:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.civilsociety.ngo/peers/peer0.org3.civilsociety.ngo/tls/ca.crt

echo "=== Step 10: Initializing Election on Ledger ==="
peer chaincode invoke \
  -o orderer.aegis.election:7050 \
  --ordererTLSHostnameOverride orderer.aegis.election \
  --tls \
  --cafile ${ORDERER_CA} \
  -C ${CHANNEL_NAME} \
  -n ${CC_NAME} \
  --peerAddresses peer0.org1.ec.gov:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.ec.gov/peers/peer0.org1.ec.gov/tls/ca.crt \
  --peerAddresses peer0.org2.observer.org:8051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.observer.org/peers/peer0.org2.observer.org/tls/ca.crt \
  -c '{"function":"InitElection","Args":["election-pesce-2026","PESCE Student Council Election 2026","[\"Candidate Alpha\",\"Candidate Beta\",\"Candidate Gamma\"]","12345678901234567890","12345678901234567891"]}'

echo "=== Chaincode Successfully Deployed and Initialized! ==="
