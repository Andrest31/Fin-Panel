import { http, HttpResponse } from "msw";
import {
  applyCollaborationChange,
  applyLiveDetailMutation,
  applyLiveQueueMutation,
  applyStatusChange,
  buildRelatedOperations,
  filterOperations,
  sortOperations,
  toListItem,
} from "./lib/operations";
import { maybeApplyScenario, getScenario, getVolume } from "./lib/scenario";
import { getStore } from "./lib/store";
import type {
  CollaborationUpdateRequest,
  OperationsSortBy,
  OperationStatus,
  SortOrder,
  StatusUpdateRequest,
} from "./lib/types";

export const handlers = [
  http.get("/api/operations", async ({ request }) => {
    const scenarioResponse = await maybeApplyScenario(request);

    if (scenarioResponse) {
      return scenarioResponse;
    }

    const volume = getVolume(request);
    const store = getStore(volume);

    applyLiveQueueMutation(store);

    const url = new URL(request.url);

    const rawPage = Number(url.searchParams.get("page") ?? "1");
    const rawPageSize = Number(url.searchParams.get("pageSize") ?? "10");
    const sortBy =
      (url.searchParams.get("sortBy") as OperationsSortBy | null) ??
      "createdAt";
    const order = (url.searchParams.get("order") as SortOrder | null) ?? "desc";

    const page = Number.isNaN(rawPage) ? 1 : Math.max(1, rawPage);
    const pageSize = Number.isNaN(rawPageSize)
      ? 10
      : Math.min(100, Math.max(1, rawPageSize));

    const filtered = filterOperations(store.operations, url);
    const sorted = sortOperations(filtered, sortBy, order);

    const startIndex = (page - 1) * pageSize;
    const paginatedItems = sorted.slice(startIndex, startIndex + pageSize);

    return HttpResponse.json({
      items: paginatedItems.map(toListItem),
      total: sorted.length,
      page,
      pageSize,
      refreshedAt: new Date().toISOString(),
    });
  }),

  http.get("/api/operations/:id", async ({ params, request }) => {
    const scenarioResponse = await maybeApplyScenario(request);

    if (scenarioResponse) {
      return scenarioResponse;
    }

    const volume = getVolume(request);
    const store = getStore(volume);

    applyLiveQueueMutation(store);

    const operation = store.operations.find((item) => item.id === params.id);

    if (!operation) {
      return HttpResponse.json(
        { message: "Operation not found" },
        { status: 404 },
      );
    }

    applyLiveDetailMutation(store, operation);

    return HttpResponse.json({
      ...operation,
      relatedOperations: buildRelatedOperations(store.operations, operation),
    });
  }),

  http.patch("/api/operations/:id/status", async ({ params, request }) => {
    const scenarioResponse = await maybeApplyScenario(request);

    if (scenarioResponse) {
      return scenarioResponse;
    }

    const volume = getVolume(request);
    const store = getStore(volume);

    const operation = store.operations.find((item) => item.id === params.id);

    if (!operation) {
      return HttpResponse.json(
        { message: "Operation not found" },
        { status: 404 },
      );
    }

    if (getScenario(request) === "conflict") {
      return HttpResponse.json(
        { message: "Operation was already updated by another analyst" },
        { status: 409 },
      );
    }

    const body = (await request.json()) as StatusUpdateRequest;
    const nextStatus = body.status;

    if (!nextStatus) {
      return HttpResponse.json(
        { message: "Status is required" },
        { status: 400 },
      );
    }

    applyStatusChange(operation, nextStatus, body.reason, body.comment);

    return HttpResponse.json({
      ...operation,
      relatedOperations: buildRelatedOperations(store.operations, operation),
    });
  }),

  http.patch("/api/operations/bulk-status", async ({ request }) => {
    const scenarioResponse = await maybeApplyScenario(request);

    if (scenarioResponse) {
      return scenarioResponse;
    }

    if (getScenario(request) === "conflict") {
      return HttpResponse.json(
        { message: "Some operations were already updated by another analyst" },
        { status: 409 },
      );
    }

    const volume = getVolume(request);
    const store = getStore(volume);

    const body = (await request.json()) as {
      ids?: string[];
      status?: OperationStatus;
      reason?: string;
      comment?: string;
    };

    if (!body.ids?.length) {
      return HttpResponse.json(
        { message: "Ids are required" },
        { status: 400 },
      );
    }

    if (!body.status) {
      return HttpResponse.json(
        { message: "Status is required" },
        { status: 400 },
      );
    }

    const updatedIds: string[] = [];

    body.ids.forEach((id) => {
      const operation = store.operations.find((item) => item.id === id);

      if (!operation) return;

      applyStatusChange(operation, body.status!, body.reason, body.comment);
      updatedIds.push(id);
    });

    return HttpResponse.json({
      updatedIds,
      status: body.status,
    });
  }),

  http.patch(
    "/api/operations/:id/collaboration",
    async ({ params, request }) => {
      const scenarioResponse = await maybeApplyScenario(request);

      if (scenarioResponse) {
        return scenarioResponse;
      }

      const volume = getVolume(request);
      const store = getStore(volume);

      const operation = store.operations.find((item) => item.id === params.id);

      if (!operation) {
        return HttpResponse.json(
          { message: "Operation not found" },
          { status: 404 },
        );
      }

      if (getScenario(request) === "conflict") {
        return HttpResponse.json(
          { message: "Case was already updated by another specialist" },
          { status: 409 },
        );
      }

      const body = (await request.json()) as CollaborationUpdateRequest;

      if (!body.action || !body.reason || !body.note) {
        return HttpResponse.json(
          { message: "Invalid collaboration payload" },
          { status: 400 },
        );
      }

      applyCollaborationChange(operation, body);

      return HttpResponse.json({
        ...operation,
        relatedOperations: buildRelatedOperations(store.operations, operation),
      });
    },
  ),
];
