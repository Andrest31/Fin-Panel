import { baseOperations, volumeCounts } from './data';
import type {
  MockDataVolume,
  OperationRecord,
  OperationRiskLevel,
  OperationStatus,
  StoreState,
} from './types';

const stores: Partial<Record<MockDataVolume, StoreState>> = {};

function cloneOperation(source: OperationRecord, index: number): OperationRecord {
  const createdAt = new Date(Date.now() - index * 90_000);
  const updatedAt = new Date(createdAt.getTime() + 60_000);

  const scoreDelta = (index % 7) - 3;
  const riskScore = Math.max(1, Math.min(99, source.riskScore + scoreDelta));

  const riskLevel: OperationRiskLevel =
    riskScore >= 75 ? 'high' : riskScore >= 35 ? 'medium' : 'low';

  const statusCycle: OperationStatus[] = ['new', 'in_review', 'approved', 'blocked', 'flagged'];
  const status = statusCycle[index % statusCycle.length];

  return {
    ...structuredClone(source),
    id: `${source.id}_${index + 1}`,
    merchant: index < 12 ? source.merchant : `${source.merchant} ${index + 1}`,
    amount: Math.max(100, source.amount + (index % 11) * 170),
    status,
    riskLevel,
    riskScore,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    customerId: `${source.customerId}_${index % 8}`,
    deviceId: `${source.deviceId}_${index % 6}`,
    ipAddress: `10.${(index % 200) + 1}.${(index % 50) + 10}.${(index % 230) + 20}`,
    reviewer: status === 'new' || status === 'flagged' ? null : `analyst_0${(index % 4) + 1}`,
    history: source.history.map((event, eventIndex) => ({
      ...structuredClone(event),
      id: `${event.id}_${index + 1}_${eventIndex + 1}`,
      timestamp: new Date(createdAt.getTime() + eventIndex * 45_000).toISOString(),
    })),
    collaborationNotes: source.collaborationNotes.map((note, noteIndex) => ({
      ...structuredClone(note),
      id: `${note.id}_${index + 1}_${noteIndex + 1}`,
      createdAt: new Date(createdAt.getTime() + 30_000 + noteIndex * 30_000).toISOString(),
    })),
  };
}

function buildDataset(volume: MockDataVolume): OperationRecord[] {
  const count = volumeCounts[volume];
  const result: OperationRecord[] = [];

  for (let index = 0; index < count; index += 1) {
    const source = baseOperations[index % baseOperations.length];
    result.push(cloneOperation(source, index));
  }

  return result.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function getStore(volume: MockDataVolume): StoreState {
  const existing = stores[volume];

  if (existing) {
    return existing;
  }

  const operations = buildDataset(volume);

  const store: StoreState = {
    operations,
    lastMutationAt: Date.now(),
    lastDetailMutationAtById: {},
    nextRealtimeId: operations.length + 1000,
  };

  stores[volume] = store;
  return store;
}

export { getStore };