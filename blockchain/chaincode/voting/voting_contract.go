package main

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing encrypted ballots and nullifiers
type SmartContract struct {
	contractapi.Contract
}

// ElectionMetadata represents the election configuration stored on-chain
type ElectionMetadata struct {
	ElectionID   string   `json:"election_id"`
	Title        string   `json:"title"`
	Candidates   []string `json:"candidates"`
	PublicKeyN   string   `json:"public_key_n"`
	PublicKeyG   string   `json:"public_key_g"`
	BallotCount  int      `json:"ballot_count"`
	MerkleRoot   string   `json:"merkle_root"`
	Status       string   `json:"status"` // "ACTIVE", "CLOSED", "TALLIED"
}

// BallotRecord represents an accepted encrypted ballot
type BallotRecord struct {
	TxID            string `json:"tx_id"`
	ElectionID      string `json:"election_id"`
	Nullifier       string `json:"nullifier"`
	EncryptedVector string `json:"encrypted_vector"`
	ZKPProof        string `json:"zkp_proof"`
	Timestamp       string `json:"timestamp"`
}

// InitElection initializes a new election parameters on the ledger
func (s *SmartContract) InitElection(ctx contractapi.TransactionContextInterface, electionID string, title string, candidatesJSON string, pubKeyN string, pubKeyG string) error {
	exists, err := ctx.GetStub().GetState("ELECTION_" + electionID)
	if err != nil {
		return fmt.Errorf("failed to read world state: %v", err)
	}
	if exists != nil {
		return fmt.Errorf("election %s already exists", electionID)
	}

	var candidates []string
	err = json.Unmarshal([]byte(candidatesJSON), &candidates)
	if err != nil {
		return fmt.Errorf("failed to parse candidates JSON: %v", err)
	}

	meta := ElectionMetadata{
		ElectionID:  electionID,
		Title:       title,
		Candidates:  candidates,
		PublicKeyN:  pubKeyN,
		PublicKeyG:  pubKeyG,
		BallotCount: 0,
		MerkleRoot:  "0000000000000000000000000000000000000000000000000000000000000000",
		Status:      "ACTIVE",
	}

	metaBytes, _ := json.Marshal(meta)
	return ctx.GetStub().PutState("ELECTION_"+electionID, metaBytes)
}

// CastBallot records a validated encrypted ballot with strict nullifier uniqueness
func (s *SmartContract) CastBallot(ctx contractapi.TransactionContextInterface, electionID string, nullifier string, encryptedVectorJSON string, zkpProofJSON string, timestamp string) error {
	// 1. Double Voting Check: Nullifier Uniqueness
	nullifierKey := fmt.Sprintf("NULLIFIER_%s_%s", electionID, nullifier)
	existingNullifier, err := ctx.GetStub().GetState(nullifierKey)
	if err != nil {
		return fmt.Errorf("failed to read nullifier state: %v", err)
	}
	if existingNullifier != nil {
		return fmt.Errorf("DOUBLE_VOTING_ERROR: Nullifier %s has already been recorded on the ledger", nullifier)
	}

	// 2. Fetch Election metadata
	electionBytes, err := ctx.GetStub().GetState("ELECTION_" + electionID)
	if err != nil || electionBytes == nil {
		return fmt.Errorf("election %s not found on ledger", electionID)
	}
	var meta ElectionMetadata
	json.Unmarshal(electionBytes, &meta)

	if meta.Status != "ACTIVE" {
		return fmt.Errorf("voting is closed for election %s (current status: %s)", electionID, meta.Status)
	}

	// 3. Mark Nullifier as consumed in the same atomic transaction
	err = ctx.GetStub().PutState(nullifierKey, []byte("SPENT"))
	if err != nil {
		return fmt.Errorf("failed to store nullifier: %v", err)
	}

	// 4. Record Ballot
	txID := ctx.GetStub().GetTxID()
	ballot := BallotRecord{
		TxID:            txID,
		ElectionID:      electionID,
		Nullifier:       nullifier,
		EncryptedVector: encryptedVectorJSON,
		ZKPProof:        zkpProofJSON,
		Timestamp:       timestamp,
	}

	ballotBytes, _ := json.Marshal(ballot)
	ballotKey := fmt.Sprintf("BALLOT_%s_%d", electionID, meta.BallotCount+1)
	err = ctx.GetStub().PutState(ballotKey, ballotBytes)
	if err != nil {
		return fmt.Errorf("failed to store ballot: %v", err)
	}

	// 5. Update Election Ballot Count
	meta.BallotCount++
	updatedMetaBytes, _ := json.Marshal(meta)
	return ctx.GetStub().PutState("ELECTION_"+electionID, updatedMetaBytes)
}

// QueryElection returns metadata for a given election
func (s *SmartContract) QueryElection(ctx contractapi.TransactionContextInterface, electionID string) (*ElectionMetadata, error) {
	bytes, err := ctx.GetStub().GetState("ELECTION_" + electionID)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if bytes == nil {
		return nil, fmt.Errorf("election %s does not exist", electionID)
	}
	var meta ElectionMetadata
	json.Unmarshal(bytes, &meta)
	return &meta, nil
}

func main() {
	cc, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		log.Panicf("Error creating AegisVote chaincode: %v", err)
	}
	if err := cc.Start(); err != nil {
		log.Panicf("Error starting AegisVote chaincode: %v", err)
	}
}

