// Background sync — registra tarefa com expo-background-fetch.
// Quando o SO acorda o app em background, processa a fila offline.
// IMPORTANTE: defineTask DEVE ser chamado no top-level do módulo
// (importado no _layout.tsx antes de qualquer render).

import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

import { processarFila } from "./offline-queue";

// ---------------------------------------------------------------------------
// Nome da task (único por app)
// ---------------------------------------------------------------------------

export const BACKGROUND_SYNC_TASK = "2f-agro-background-sync";

// ---------------------------------------------------------------------------
// Definição da task (top-level — executada pelo SO em background)
// ---------------------------------------------------------------------------

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    const processadas = await processarFila();
    // BackgroundFetch.Result:
    //   NewData  → tinha dados pra processar
    //   NoData   → fila vazia
    //   Failed   → erro
    return processadas > 0
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// ---------------------------------------------------------------------------
// Registro — chamado uma vez no boot do app
// ---------------------------------------------------------------------------

export async function registrarBackgroundSync(): Promise<void> {
  const status = await BackgroundFetch.getStatusAsync();

  if (status === BackgroundFetch.BackgroundFetchStatus.Denied) {
    // Usuário desabilitou atualização em segundo plano nas configurações.
    // Não tem o que fazer — sync acontece só quando o app está aberto.
    return;
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_SYNC_TASK,
  );

  if (!isRegistered) {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: 15 * 60, // 15 minutos (mínimo recomendado pelo iOS)
      stopOnTerminate: false,   // Android: continua após app ser fechado
      startOnBoot: true,        // Android: inicia no boot do dispositivo
    });
  }
}
