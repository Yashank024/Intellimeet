import os
import chromadb
import logging
from typing import List, Dict, Any, Optional
from rag.embedder import Embedder

logger = logging.getLogger("IntelliMeet.ChromaService")

CHROMA_DB_PATH = "chroma_db"

class ChromaService:
    def __init__(self):
        # Persistent storage for Chroma DB
        os.makedirs(CHROMA_DB_PATH, exist_ok=True)
        self.client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
        self.embedding_service = Embedder()
        
        # Define 5 collections
        self.collections = {
            "meeting_chunks": self.client.get_or_create_collection("meeting_chunks"),
            "meeting_summaries": self.client.get_or_create_collection("meeting_summaries"),
            "risks": self.client.get_or_create_collection("risks"),
            "escalations": self.client.get_or_create_collection("escalations"),
            "decisions": self.client.get_or_create_collection("decisions")
        }
        logger.info(f"Initialized ChromaDB with 5 collections at: {CHROMA_DB_PATH}")

    def add_meeting_chunks(self, meeting_id: int, chunks: List[str], metadata: Dict[str, Any]):
        """
        Embeds and adds multiple text chunks to the meeting_chunks collection.
        Metadata includes: project_name, title, date, etc.
        """
        if not chunks:
            return
        
        collection = self.collections["meeting_chunks"]
        embeddings = self.embedding_service.get_embeddings(chunks)
        
        ids = [f"chunk_{meeting_id}_{i}" for i in range(len(chunks))]
        # Extend metadata to include meeting_id and specific chunk details
        metadatas = []
        for i, chunk in enumerate(chunks):
            m = metadata.copy()
            m["meeting_id"] = meeting_id
            m["chunk_id"] = i
            metadatas.append(m)

        collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas
        )
        logger.info(f"Indexed {len(chunks)} chunks for meeting {meeting_id} into meeting_chunks.")

    def add_item_to_collection(self, collection_name: str, item_id: str, document: str, metadata: Dict[str, Any]):
        """
        Embeds and adds a single item (summary, risk, escalation, decision) to the specified collection.
        """
        if collection_name not in self.collections:
            logger.error(f"Collection {collection_name} does not exist.")
            return
        
        collection = self.collections[collection_name]
        embedding = self.embedding_service.get_embedding(document)
        
        collection.add(
            ids=[item_id],
            embeddings=[embedding],
            documents=[document],
            metadatas=[metadata]
        )
        logger.info(f"Indexed item '{item_id}' into collection '{collection_name}'.")

    def query_collection(self, collection_name: str, query: str, limit: int = 3) -> List[Dict[str, Any]]:
        """
        Runs a vector similarity search on the specified collection.
        """
        if collection_name not in self.collections:
            logger.error(f"Collection {collection_name} does not exist.")
            return []
        
        collection = self.collections[collection_name]
        query_embedding = self.embedding_service.get_embedding(query)
        
        try:
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=limit
            )
            
            output = []
            if results and results.get("documents") and results["documents"][0]:
                for idx in range(len(results["documents"][0])):
                    output.append({
                        "id": results["ids"][0][idx],
                        "document": results["documents"][0][idx],
                        "metadata": results["metadatas"][0][idx] if results.get("metadatas") else {},
                        "distance": results["distances"][0][idx] if results.get("distances") else 0.0
                    })
            return output
        except Exception as e:
            logger.error(f"ChromaDB search query failed on collection {collection_name}: {e}")
            return []

    def query_all_collections(self, query: str, limit: int = 2) -> Dict[str, List[Dict[str, Any]]]:
        """
        Queries all collections for the given query to retrieve global semantic context.
        """
        results = {}
        for name in self.collections.keys():
            results[name] = self.query_collection(name, query, limit)
        return results
