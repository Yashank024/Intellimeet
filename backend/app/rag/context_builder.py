import logging
from typing import List

logger = logging.getLogger("IntelliMeet.ContextBuilder")

# Hard limit on context words sent to Gemini
MAX_CONTEXT_WORDS = 900


def build_compressed_context(chunks: List[str]) -> str:
    """
    Sorts retrieved chunks by estimated informativeness (length proxy),
    then concatenates until MAX_CONTEXT_WORDS is reached.
    Logs token budget for observability.
    """
    # Sort by length descending — longer chunks are typically more informative
    sorted_chunks = sorted(chunks, key=lambda c: len(c.split()), reverse=True)

    final_parts: List[str] = []
    total_words = 0

    for chunk in sorted_chunks:
        chunk_words = len(chunk.split())
        if total_words + chunk_words > MAX_CONTEXT_WORDS:
            # Truncate this chunk to fit within budget
            remaining = MAX_CONTEXT_WORDS - total_words
            if remaining > 30:  # Only add if meaningful space remains
                truncated = " ".join(chunk.split()[:remaining]) + "..."
                final_parts.append(truncated)
                total_words += remaining
            break
        final_parts.append(chunk)
        total_words += chunk_words

    estimated_tokens = int(total_words * 1.35)  # ~1.35 tokens per word
    logger.info(
        f"[ContextBuilder] Chunks: {len(sorted_chunks)} → Used: {len(final_parts)} | "
        f"Words: {total_words} | Est. Tokens: {estimated_tokens}"
    )

    if estimated_tokens > 3000:
        logger.warning(
            f"[ContextBuilder] Token budget exceeded {estimated_tokens} > 3000. "
            f"Context was hard-truncated to {MAX_CONTEXT_WORDS} words."
        )

    return "\n\n---\n\n".join(final_parts)
