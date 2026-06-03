import { useCallback, useEffect, useState } from "react";
import {
  createMeasurement as createStoredMeasurement,
  deleteMeasurement as deleteStoredMeasurement,
  getMeasurements,
  MEASUREMENTS_CHANGED_EVENT,
  updateMeasurement as updateStoredMeasurement,
} from "@/services/measurements";
import type { Measurement, MeasurementInput } from "@/types/measurement";

export function useMeasurements() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  const refreshMeasurements = useCallback(() => {
    setMeasurements(getMeasurements());
  }, []);

  useEffect(() => {
    refreshMeasurements();

    window.addEventListener(MEASUREMENTS_CHANGED_EVENT, refreshMeasurements);
    window.addEventListener("storage", refreshMeasurements);

    return () => {
      window.removeEventListener(MEASUREMENTS_CHANGED_EVENT, refreshMeasurements);
      window.removeEventListener("storage", refreshMeasurements);
    };
  }, [refreshMeasurements]);

  const createMeasurement = useCallback(
    (input: MeasurementInput) => {
      const measurement = createStoredMeasurement(input);
      refreshMeasurements();
      return measurement;
    },
    [refreshMeasurements],
  );

  const updateMeasurement = useCallback(
    (id: string, input: MeasurementInput) => {
      const measurement = updateStoredMeasurement(id, input);
      refreshMeasurements();
      return measurement;
    },
    [refreshMeasurements],
  );

  const deleteMeasurement = useCallback(
    (id: string) => {
      deleteStoredMeasurement(id);
      refreshMeasurements();
    },
    [refreshMeasurements],
  );

  return {
    measurements,
    createMeasurement,
    updateMeasurement,
    deleteMeasurement,
    refreshMeasurements,
  };
}
