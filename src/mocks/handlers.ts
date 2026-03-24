import { http, HttpResponse } from "msw";

const operations = [
  {
    id: "op_001",
    merchant: "TechMarket",
    amount: 12500,
    currency: "RUB",
    status: "new",
    riskLevel: "high",
    createdAt: "2026-03-24T10:15:00.000Z",
    updatedAt: "2026-03-24T10:20:00.000Z",
    customerId: "cus_1001",
    paymentMethod: "card",
    country: "RU",
    city: "Moscow",
    deviceId: "dev_9001",
    ipAddress: "91.240.12.11",
    reviewer: null,
    flagReasons: ["large_amount", "new_device", "velocity_spike"],
    history: [
      {
        id: "evt_001",
        type: "created",
        timestamp: "2026-03-24T10:15:00.000Z",
        actor: "system",
        comment: "Operation created and sent to queue",
      },
      {
        id: "evt_002",
        type: "risk_scored",
        timestamp: "2026-03-24T10:16:30.000Z",
        actor: "system",
        comment: "Risk level set to high",
      },
    ],
  },
  {
    id: "op_002",
    merchant: "Daily Coffee",
    amount: 420,
    currency: "RUB",
    status: "approved",
    riskLevel: "low",
    createdAt: "2026-03-24T10:18:00.000Z",
    updatedAt: "2026-03-24T10:19:00.000Z",
    customerId: "cus_1002",
    paymentMethod: "card",
    country: "RU",
    city: "Saint Petersburg",
    deviceId: "dev_9002",
    ipAddress: "95.82.44.23",
    reviewer: "analyst_01",
    flagReasons: [],
    history: [
      {
        id: "evt_003",
        type: "created",
        timestamp: "2026-03-24T10:18:00.000Z",
        actor: "system",
        comment: "Operation created",
      },
      {
        id: "evt_004",
        type: "approved",
        timestamp: "2026-03-24T10:19:00.000Z",
        actor: "analyst_01",
        comment: "No suspicious signals found",
      },
    ],
  },
  {
    id: "op_003",
    merchant: "Fast Electronics",
    amount: 18990,
    currency: "RUB",
    status: "in_review",
    riskLevel: "medium",
    createdAt: "2026-03-24T10:21:00.000Z",
    updatedAt: "2026-03-24T10:25:00.000Z",
    customerId: "cus_1003",
    paymentMethod: "sbp",
    country: "RU",
    city: "Kazan",
    deviceId: "dev_9003",
    ipAddress: "178.45.201.8",
    reviewer: "analyst_02",
    flagReasons: ["merchant_pattern"],
    history: [
      {
        id: "evt_005",
        type: "created",
        timestamp: "2026-03-24T10:21:00.000Z",
        actor: "system",
        comment: "Operation created",
      },
      {
        id: "evt_006",
        type: "sent_to_review",
        timestamp: "2026-03-24T10:25:00.000Z",
        actor: "system",
        comment: "Sent to analyst review",
      },
    ],
  },
];

export const handlers = [
  http.get("/api/operations", async () => {
    return HttpResponse.json(
      operations.map((operation) => {
        const { history, ...rest } = operation;
        void history;
        return rest;
      }),
    );
  }),

  http.get("/api/operations/:id", async ({ params }) => {
    const operation = operations.find((item) => item.id === params.id);

    if (!operation) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(operation);
  }),
];
