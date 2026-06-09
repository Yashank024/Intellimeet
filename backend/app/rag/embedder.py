import logging
from sentence_transformers import SentenceTransformer

logger = logging.getLogger("IntelliMeet.Embedder")

_model_instance = None

def get_embedding_model():
    global _model_instance
    if _model_instance is None:
        logger.info("Initializing SentenceTransformer model 'all-MiniLM-L6-v2'...")
        _model_instance = SentenceTransformer("all-MiniLM-L6-v2")
        logger.info("SentenceTransformer model loaded successfully.")
    return _model_instance

class Embedder:
    def __init__(self):
        self.model = get_embedding_model()

    def get_embedding(self, text: str) -> list:
        if not text:
            return []
        try:
            embedding = self.model.encode(text, convert_to_numpy=True).tolist()
            return embedding
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            return []

    def get_embeddings(self, texts: list) -> list:
        if not texts:
            return []
        try:
            embeddings = self.model.encode(texts, convert_to_numpy=True).tolist()
            return embeddings
        except Exception as e:
            logger.error(f"Failed to generate batch embeddings: {e}")
            return [[] for _ in texts]
