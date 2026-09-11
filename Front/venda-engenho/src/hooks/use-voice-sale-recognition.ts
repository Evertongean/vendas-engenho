import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  ExpoSpeechRecognitionErrorEvent,
  ExpoSpeechRecognitionResultEvent,
} from "expo-speech-recognition";

interface VoiceRecognitionFeedback {
  title: string;
  message: string;
}

interface UseVoiceSaleRecognitionOptions {
  contextualStrings: string[];
  onFeedback: (feedback: VoiceRecognitionFeedback) => void;
  onTranscript: (transcript: string) => void;
}

type SpeechRecognitionModule =
  typeof import("expo-speech-recognition").ExpoSpeechRecognitionModule;

type SpeechRecognitionSubscription = {
  remove: () => void;
};

type VoiceRecognitionState = "idle" | "starting" | "listening" | "processing";

const PERMISSION_DENIED_FEEDBACK: VoiceRecognitionFeedback = {
  title: "Microfone",
  message: "Permissão de microfone necessária para usar venda por voz.",
};

const NO_SPEECH_FEEDBACK: VoiceRecognitionFeedback = {
  title: "Venda por voz",
  message: "Não consegui identificar nenhum produto.",
};

const DEVELOPMENT_BUILD_FEEDBACK: VoiceRecognitionFeedback = {
  title: "Venda por voz indisponível",
  message:
    "O reconhecimento de voz precisa de uma Development Build para funcionar no Android.",
};

const UNAVAILABLE_FEEDBACK: VoiceRecognitionFeedback = {
  title: "Venda por voz indisponível",
  message:
    "O reconhecimento de voz não está disponível neste dispositivo. Verifique o serviço de fala do Android.",
};

export function useVoiceSaleRecognition({
  contextualStrings,
  onFeedback,
  onTranscript,
}: UseVoiceSaleRecognitionOptions) {
  const [state, setState] = useState<VoiceRecognitionState>("idle");
  const speechModuleRef = useRef<SpeechRecognitionModule | null>(null);
  const subscriptionsRef = useRef<SpeechRecognitionSubscription[]>([]);
  const handledFinalResultRef = useRef(false);
  const onFeedbackRef = useRef(onFeedback);
  const onTranscriptRef = useRef(onTranscript);
  const contextualStringsRef = useRef(contextualStrings);

  useEffect(() => {
    onFeedbackRef.current = onFeedback;
  }, [onFeedback]);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    contextualStringsRef.current = contextualStrings;
  }, [contextualStrings]);

  const clearSubscriptions = useCallback(() => {
    subscriptionsRef.current.forEach((subscription) => {
      subscription.remove();
    });
    subscriptionsRef.current = [];
  }, []);

  const finishRecognition = useCallback(() => {
    setState("idle");
    clearSubscriptions();
  }, [clearSubscriptions]);

  const handleResult = useCallback((event: ExpoSpeechRecognitionResultEvent) => {
    if (!event.isFinal || handledFinalResultRef.current) {
      return;
    }

    handledFinalResultRef.current = true;
    setState("processing");

    const transcript = event.results[0]?.transcript?.trim() ?? "";

    if (!transcript) {
      onFeedbackRef.current(NO_SPEECH_FEEDBACK);
      return;
    }

    onTranscriptRef.current(transcript);
  }, []);

  const handleNoMatch = useCallback(() => {
    if (handledFinalResultRef.current) {
      return;
    }

    handledFinalResultRef.current = true;
    onFeedbackRef.current(NO_SPEECH_FEEDBACK);
  }, []);

  const handleError = useCallback((event: ExpoSpeechRecognitionErrorEvent) => {
    if (event.error === "aborted") {
      return;
    }

    if (event.error === "not-allowed") {
      onFeedbackRef.current(PERMISSION_DENIED_FEEDBACK);
      return;
    }

    if (event.error === "no-speech" || event.error === "speech-timeout") {
      onFeedbackRef.current(NO_SPEECH_FEEDBACK);
      return;
    }

    if (
      event.error === "service-not-allowed" ||
      event.error === "language-not-supported"
    ) {
      onFeedbackRef.current(UNAVAILABLE_FEEDBACK);
      return;
    }

    if (event.error === "busy") {
      onFeedbackRef.current({
        title: "Venda por voz",
        message: "O reconhecimento de voz já está em uso. Tente novamente.",
      });
      return;
    }

    onFeedbackRef.current({
      title: "Venda por voz",
      message:
        event.error === "network"
          ? "O serviço de reconhecimento de voz não respondeu. Tente novamente."
          : "Não foi possível concluir o reconhecimento de voz. Tente novamente.",
    });
  }, []);

  const loadSpeechModule = useCallback(async () => {
    try {
      const speechRecognition = await import("expo-speech-recognition");
      speechModuleRef.current = speechRecognition.ExpoSpeechRecognitionModule;
      return speechRecognition.ExpoSpeechRecognitionModule;
    } catch (error) {
      console.warn("Nao foi possivel carregar reconhecimento de voz.", error);
      return null;
    }
  }, []);

  const start = useCallback(async () => {
    if (state !== "idle") {
      return;
    }

    setState("starting");
    const speechModule = await loadSpeechModule();

    if (!speechModule) {
      setState("idle");
      onFeedbackRef.current(DEVELOPMENT_BUILD_FEEDBACK);
      return;
    }

    clearSubscriptions();
    handledFinalResultRef.current = false;

    subscriptionsRef.current = [
      speechModule.addListener("start", () => {
        setState("listening");
      }),
      speechModule.addListener("end", () => {
        finishRecognition();
      }),
      speechModule.addListener("result", handleResult),
      speechModule.addListener("nomatch", handleNoMatch),
      speechModule.addListener("error", handleError),
    ];

    try {
      if (!speechModule.isRecognitionAvailable()) {
        finishRecognition();
        onFeedbackRef.current(UNAVAILABLE_FEEDBACK);
        return;
      }

      const permission = await speechModule.requestPermissionsAsync();

      if (!permission.granted) {
        finishRecognition();
        onFeedbackRef.current(PERMISSION_DENIED_FEEDBACK);
        return;
      }

      speechModule.start({
        lang: "pt-BR",
        interimResults: false,
        maxAlternatives: 1,
        continuous: false,
        contextualStrings: contextualStringsRef.current,
        recordingOptions: {
          persist: false,
        },
      });
    } catch (error) {
      console.warn("Nao foi possivel iniciar venda por voz.", error);
      finishRecognition();
      onFeedbackRef.current({
        title: "Venda por voz",
        message:
          "Não foi possível iniciar o reconhecimento de voz. Tente novamente.",
      });
    }
  }, [
    clearSubscriptions,
    finishRecognition,
    handleError,
    handleNoMatch,
    handleResult,
    loadSpeechModule,
    state,
  ]);

  const stop = useCallback(() => {
    try {
      setState("processing");
      speechModuleRef.current?.stop();
    } catch (error) {
      console.warn("Nao foi possivel parar venda por voz.", error);
      finishRecognition();
    }
  }, [finishRecognition]);

  useEffect(() => {
    return () => {
      try {
        speechModuleRef.current?.abort();
      } catch {
        // The recognizer can already be inactive during screen disposal.
      }

      clearSubscriptions();
    };
  }, [clearSubscriptions]);

  return useMemo(
    () => ({
      isListening: state === "listening",
      isVoiceBusy: state !== "idle",
      start,
      state,
      stop,
    }),
    [start, state, stop]
  );
}
