import { useState, useMemo } from "react";
import { MODELS } from "./data/models.js";

export function useCatalog() {
  return { models: MODELS, loading: false, error: null };
}
