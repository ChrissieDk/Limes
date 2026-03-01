import { useEffect, useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { SimCard as SimCardModel } from './dashboardTypes.ts';

interface UseSimSearchParams {
  simCards: SimCardModel[];
  currentSimIndex: number;
  setCurrentSimIndex: Dispatch<SetStateAction<number>>;
}

interface UseSimSearchResult {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  hasResults: boolean;
  displayPosition: number;
  displayTotal: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  goPrev: () => void;
  goNext: () => void;
}

const normalize = (value: string) => value.trim().toLowerCase();
const SEARCH_DEBOUNCE_MS = 250;

export function useSimSearch({
  simCards,
  currentSimIndex,
  setCurrentSimIndex,
}: UseSimSearchParams): UseSimSearchResult {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchTerm]);

  const normalizedSearchTerm = useMemo(() => normalize(debouncedSearchTerm), [debouncedSearchTerm]);
  const isSearching = normalizedSearchTerm.length > 0;

  const matchedIndices = useMemo(() => {
    if (!isSearching) {
      return simCards.map((_, index) => index);
    }

    return simCards.reduce<number[]>((acc, sim, index) => {
      const simName = normalize(sim.name);
      const simPhoneNumber = normalize(sim.phoneNumber);
      if (simName.includes(normalizedSearchTerm) || simPhoneNumber.includes(normalizedSearchTerm)) {
        acc.push(index);
      }
      return acc;
    }, []);
  }, [simCards, isSearching, normalizedSearchTerm]);

  useEffect(() => {
    if (simCards.length === 0) {
      return;
    }

    if (currentSimIndex >= simCards.length) {
      setCurrentSimIndex(0);
      return;
    }

    if (matchedIndices.length === 0) {
      return;
    }

    const isCurrentSimVisible = matchedIndices.includes(currentSimIndex);
    if (!isCurrentSimVisible) {
      setCurrentSimIndex(matchedIndices[0]);
    }
  }, [simCards.length, currentSimIndex, matchedIndices, setCurrentSimIndex]);

  const currentSearchPosition = matchedIndices.indexOf(currentSimIndex);
  const displayPosition = matchedIndices.length === 0 ? 0 : currentSearchPosition + 1;
  const displayTotal = matchedIndices.length;

  const canGoPrev = currentSearchPosition > 0;
  const canGoNext = currentSearchPosition >= 0 && currentSearchPosition < matchedIndices.length - 1;

  const goPrev = () => {
    if (!canGoPrev) {
      return;
    }
    setCurrentSimIndex(matchedIndices[currentSearchPosition - 1]);
  };

  const goNext = () => {
    if (!canGoNext) {
      return;
    }
    setCurrentSimIndex(matchedIndices[currentSearchPosition + 1]);
  };

  return {
    searchTerm,
    setSearchTerm,
    hasResults: matchedIndices.length > 0,
    displayPosition,
    displayTotal,
    canGoPrev,
    canGoNext,
    goPrev,
    goNext,
  };
}
