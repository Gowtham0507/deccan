"""
TF-IDF + cosine similarity vector search using scikit-learn.
Zero DLL dependencies. Works perfectly on Windows.
"""
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.data.candidates import get_all_candidates, get_candidates_as_text

_vectorizer: TfidfVectorizer | None = None
_candidate_matrix = None
_candidate_ids: list[str] = []
_seeded = False


def seed_vector_store() -> dict:
    global _vectorizer, _candidate_matrix, _candidate_ids, _seeded
    if _seeded:
        return {"seeded": 0, "already_present": len(_candidate_ids)}

    candidates = get_all_candidates()
    texts = [get_candidates_as_text(c) for c in candidates]

    _vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=8000,
        sublinear_tf=True,
        stop_words="english",
    )
    _candidate_matrix = _vectorizer.fit_transform(texts)
    _candidate_ids = [c["id"] for c in candidates]
    _seeded = True
    return {"seeded": len(candidates), "already_present": 0}


def vector_search(query_text: str, top_k: int = 10) -> list[tuple[str, float]]:
    if not _seeded:
        seed_vector_store()

    query_vec = _vectorizer.transform([query_text])
    scores = cosine_similarity(query_vec, _candidate_matrix).flatten()
    top_indices = np.argsort(scores)[::-1][:top_k]

    return [
        (_candidate_ids[i], round(float(scores[i]) * 100, 2))
        for i in top_indices
    ]
