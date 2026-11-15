import json
import urllib.request
import urllib.error
from typing import Optional, Dict, Any, List
from app.core.config import settings


class SupabaseService:
    def __init__(self):
        self.url = settings.SUPABASE_URL.rstrip('/')
        self.key = settings.SUPABASE_KEY
        self.headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    def _request(self, endpoint: str, method: str = "GET", data: Optional[Dict[str, Any]] = None) -> Optional[Any]:
        """Performs a direct REST API call to Supabase PostgREST."""
        full_url = f"{self.url}/rest/v1/{endpoint}"
        body = json.dumps(data).encode('utf-8') if data else None

        req = urllib.request.Request(full_url, data=body, headers=self.headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=5) as response:
                content = response.read().decode('utf-8')
                return json.loads(content) if content else {}
        except urllib.error.HTTPError as e:
            # Table might not exist yet or query returned no match
            return None
        except Exception as e:
            # Network issue or timeout
            return None

    def get_voter(self, voter_id: str) -> Optional[Dict[str, Any]]:
        """Fetch voter KYC and credentials from Supabase."""
        res = self._request(f"voters?voter_id=eq.{voter_id}&select=*")
        if res and isinstance(res, list) and len(res) > 0:
            return res[0]
        return None

    def mark_voter_voted(self, voter_id: str) -> bool:
        """Update voter status to prevent double-voting off-chain."""
        res = self._request(f"voters?voter_id=eq.{voter_id}", method="PATCH", data={"has_voted": True})
        return res is not None

    def save_ballot_audit(self, election_id: str, block_number: int, tx_id: str, nullifier: str, ciphertext: str, merkle_leaf: str):
        """Append an off-chain indexed audit record to Supabase."""
        payload = {
            "election_id": election_id,
            "block_number": block_number,
            "tx_id": tx_id,
            "nullifier_hash": nullifier,
            "ciphertext": ciphertext,
            "merkle_leaf": merkle_leaf
        }
        return self._request("ledger_audit_log", method="POST", data=payload)

    def save_or_update_election(
        self,
        election_id: str,
        title: str,
        description: str,
        status: str,
        public_key_n: str,
        public_key_g: str = "",
        merkle_root: str = "0000000000000000000000000000000000000000000000000000000000000000"
    ):
        """Syncs active election metadata to Supabase with upsert handling."""
        payload = {
            "id": election_id,
            "title": title,
            "description": description,
            "status": status,
            "public_key_n": public_key_n,
            "public_key_g": public_key_g or str(int(public_key_n) + 1 if public_key_n.isdigit() else "1"),
            "merkle_root": merkle_root
        }
        # PostgREST upsert on conflict
        return self._request("elections?on_conflict=id", method="POST", data=payload)

    def is_connected(self) -> bool:
        """Check if Supabase tables are ready."""
        res = self._request("voters?select=count", method="HEAD")
        return res is not None


supabase_service = SupabaseService()
