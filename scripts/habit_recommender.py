"""
Simple habit similarity recommender.

Reads JSON from stdin:
{
  "habits": [{"id": "...", "name": "...", "description": "..."}],
  "targetHabitId": "...",
  "topN": 5
}

Default mode outputs JSON to stdout:
{"recommendations": [{"id": "...", "name": "...", "description": "...", "score": 0.87}, ...]}

Train mode (precompute vectors for faster inference):
python scripts/habit_recommender.py --train --output scripts/models/habit_tfidf.json < habits.json
Stores TF-IDF vectors for all habits (id/name/description) so inference can load a precomputed model.
"""

from __future__ import annotations

import json
import math
import re
import sys
from argparse import ArgumentParser
from collections import Counter
from pathlib import Path
from typing import Dict, List, Tuple

TOKEN_PATTERN = re.compile(r"[a-z0-9']+")
MODEL_PATH_DEFAULT = Path(__file__).parent / "models" / "habit_tfidf.json"


def tokenize(text: str) -> List[str]:
  return TOKEN_PATTERN.findall(text.lower())


def tf_idf_vectors(
    documents: List[Tuple[str, str]],  # (id, text)
) -> Dict[str, Dict[str, float]]:
  # Compute document frequencies
  df: Counter[str] = Counter()
  tokenized_docs: Dict[str, List[str]] = {}
  for doc_id, text in documents:
    tokens = tokenize(text)
    tokenized_docs[doc_id] = tokens
    df.update(set(tokens))

  total_docs = max(len(documents), 1)
  vectors: Dict[str, Dict[str, float]] = {}
  for doc_id, tokens in tokenized_docs.items():
    tf = Counter(tokens)
    vector: Dict[str, float] = {}
    for term, count in tf.items():
      idf = math.log((1 + total_docs) / (1 + df[term])) + 1.0
      vector[term] = (count / len(tokens)) * idf
    vectors[doc_id] = vector
  return vectors


def cosine(a: Dict[str, float], b: Dict[str, float]) -> float:
  if not a or not b:
    return 0.0
  common = set(a.keys()) & set(b.keys())
  dot = sum(a[t] * b[t] for t in common)
  norm_a = math.sqrt(sum(v * v for v in a.values()))
  norm_b = math.sqrt(sum(v * v for v in b.values()))
  if norm_a == 0 or norm_b == 0:
    return 0.0
  return dot / (norm_a * norm_b)


def recommend(
    habits: List[Dict[str, str]], target_habit_id: str, top_n: int = 5
) -> List[Dict[str, object]]:
  documents: List[Tuple[str, str]] = []
  for habit in habits:
    text = f"{habit.get('name','')} {habit.get('description','')}".strip()
    documents.append((habit["id"], text))

  vectors = tf_idf_vectors(documents)
  target_vector = vectors.get(target_habit_id, {})

  scored: List[Tuple[str, float]] = []
  for habit in habits:
    hid = habit["id"]
    if hid == target_habit_id:
      continue
    score = cosine(target_vector, vectors.get(hid, {}))
    scored.append((hid, score))

  scored.sort(key=lambda pair: pair[1], reverse=True)
  top = scored[:top_n]
  habit_by_id = {habit["id"]: habit for habit in habits}

  return [
    {
      "id": hid,
      "name": habit_by_id.get(hid, {}).get("name"),
      "description": habit_by_id.get(hid, {}).get("description"),
      "score": round(score, 4),
    }
    for hid, score in top
    if score > 0
  ]


def save_model(vectors: Dict[str, Dict[str, float]], output_path: Path) -> None:
  output_path.parent.mkdir(parents=True, exist_ok=True)
  data = {"vectors": vectors}
  output_path.write_text(json.dumps(data))


def load_model(model_path: Path) -> Dict[str, Dict[str, float]]:
  if not model_path.exists():
    return {}
  try:
    data = json.loads(model_path.read_text())
    vectors = data.get("vectors")
    if isinstance(vectors, dict):
      cleaned: Dict[str, Dict[str, float]] = {}
      for key, value in vectors.items():
        if isinstance(value, dict):
          cleaned[key] = {str(k): float(v) for k, v in value.items()}
      return cleaned
  except Exception:
    return {}
  return {}


def parse_args() -> ArgumentParser:
  parser = ArgumentParser(description="Habit similarity recommender")
  parser.add_argument("--train", action="store_true", help="Train and save model")
  parser.add_argument(
    "--output",
    type=str,
    default=str(MODEL_PATH_DEFAULT),
    help="Path to save/load the trained model",
  )
  return parser


def main() -> None:
  parser = parse_args()
  args = parser.parse_args()
  model_path = Path(args.output)

  try:
    payload = json.load(sys.stdin)
    habits = payload.get("habits") or []
    target_habit_id = payload.get("targetHabitId") or ""
    top_n = int(payload.get("topN") or 5)
  except Exception:
    json.dump({"error": "Invalid input"}, sys.stdout)
    return

  if args.train:
    vectors = tf_idf_vectors(
      [(habit["id"], f"{habit.get('name','')} {habit.get('description','')}") for habit in habits]
    )
    save_model(vectors, model_path)
    json.dump(
      {
        "status": "ok",
        "saved": str(model_path),
        "habitCount": len(vectors),
      },
      sys.stdout,
    )
    return

  if not target_habit_id:
    json.dump({"error": "Missing targetHabitId"}, sys.stdout)
    return

  # Use trained vectors if available
  model_vectors = load_model(model_path)
  if model_vectors and target_habit_id in model_vectors:
    habit_by_id = {habit["id"]: habit for habit in habits}
    target_vector = model_vectors.get(target_habit_id, {})
    scored: List[Tuple[str, float]] = []
    for hid, vec in model_vectors.items():
      if hid == target_habit_id:
        continue
      scored.append((hid, cosine(target_vector, vec)))
    scored.sort(key=lambda pair: pair[1], reverse=True)
    top = scored[:top_n]
    recommendations = [
      {
        "id": hid,
        "name": habit_by_id.get(hid, {}).get("name"),
        "description": habit_by_id.get(hid, {}).get("description"),
        "score": round(score, 4),
      }
      for hid, score in top
      if score > 0
    ]
    json.dump({"recommendations": recommendations}, sys.stdout)
    return

  recommendations = recommend(habits, target_habit_id, top_n)
  json.dump({"recommendations": recommendations}, sys.stdout)


if __name__ == "__main__":
  main()
