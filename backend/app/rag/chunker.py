from typing import List

def chunk_transcript(text: str, chunk_size: int = 800, overlap: int = 150) -> List[str]:
    """
    Chunks transcript text into logical paragraphs or segments.
    """
    if not text:
        return []
    paragraphs = text.split("\n\n")
    chunks = []
    current_chunk = []
    current_len = 0
    
    for p in paragraphs:
        p = p.strip()
        if not p:
            continue
        if current_len + len(p) <= chunk_size:
            current_chunk.append(p)
            current_len += len(p) + 2
        else:
            if current_chunk:
                chunks.append("\n\n".join(current_chunk))
            current_chunk = [p]
            current_len = len(p)
            
    if current_chunk:
        chunks.append("\n\n".join(current_chunk))
    return chunks

def find_source_chunk_index(source_text: str, chunks: List[str]) -> int:
    """
    Finds the chunk index where the source_text is referenced.
    """
    if not source_text or not chunks:
        return 0
    source_text_lower = source_text.lower().strip()
    
    for idx, chunk in enumerate(chunks):
        if source_text_lower in chunk.lower():
            return idx
            
    source_words = set(source_text_lower.split())
    if not source_words:
        return 0
    max_overlap = 0
    best_idx = 0
    for idx, chunk in enumerate(chunks):
        chunk_words = set(chunk.lower().split())
        overlap = len(source_words.intersection(chunk_words))
        if overlap > max_overlap:
            max_overlap = overlap
            best_idx = idx
    return best_idx
