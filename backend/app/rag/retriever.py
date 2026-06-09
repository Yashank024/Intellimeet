import logging
from typing import List, Dict, Any
from rag.chroma_service import ChromaService

logger = logging.getLogger("IntelliMeet.Retriever")

# Only keep chunks with similarity score above this threshold
SIMILARITY_THRESHOLD = 0.75
# Maximum chunks to retrieve from ChromaDB before threshold filtering
TOP_K = 3


class Retriever:
    def __init__(self):
        self.chroma_service = ChromaService()

    def retrieve_context(self, query: str, collection_name: str = "meeting_chunks", limit: int = TOP_K) -> List[str]:
        """
        Retrieves raw document texts matching the query semantically.
        Applies similarity threshold filtering.
        """
        results = self._retrieve_filtered(query, collection_name, limit)
        return [res["document"] for res in results]

    def retrieve_with_metadata(self, query: str, collection_name: str = "meeting_chunks", limit: int = TOP_K) -> List[Dict[str, Any]]:
        """
        Retrieves matching chunks with metadata. Applies similarity threshold.
        """
        return self._retrieve_filtered(query, collection_name, limit)

    def _retrieve_filtered(self, query: str, collection_name: str, limit: int) -> List[Dict[str, Any]]:
        """
        Fetches top_k chunks from ChromaDB, then filters out low-similarity results.
        ChromaDB distances are L2: lower = more similar.
        We convert to a 0-1 similarity score: similarity = 1 / (1 + distance)
        """
        raw = self.chroma_service.query_collection(collection_name, query, limit)

        filtered = []
        for res in raw:
            distance = res.get("distance", 1.0)
            # Convert L2 distance to similarity score (0=dissimilar, 1=identical)
            similarity = 1.0 / (1.0 + distance)
            if similarity >= SIMILARITY_THRESHOLD:
                res["similarity"] = round(similarity, 3)
                filtered.append(res)

        logger.info(
            f"[Retriever] Collection={collection_name} | "
            f"TopK={limit} | Raw={len(raw)} | AfterFilter={len(filtered)} "
            f"(threshold={SIMILARITY_THRESHOLD})"
        )
        return filtered

    def retrieve_global_context(self, query: str, limit_per_collection: int = 2) -> Dict[str, List[Dict[str, Any]]]:
        """
        Retrieves context across all collections. Kept for legacy compatibility.
        """
        return self.chroma_service.query_all_collections(query, limit_per_collection)
