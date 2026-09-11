import { useMemo } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import { useTheme } from "@/hooks/use-theme";
import type { VoiceParseResult } from "@/utils/voiceParser";

interface VoiceSaleModalProps {
  parseResult: VoiceParseResult | null;
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onRetry: () => void;
}

export default function VoiceSaleModal({
  parseResult,
  visible,
  onCancel,
  onConfirm,
  onRetry,
}: VoiceSaleModalProps) {
  const colors = useTheme();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const styles = useMemo(
    () => createStyles(colors, compact),
    [colors, compact]
  );
  const hasItems = Boolean(parseResult?.items.length);
  const hasUnrecognized = Boolean(parseResult?.unrecognized.length);

  return (
    <Modal
      animationType="fade"
      onRequestClose={onCancel}
      transparent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <Text style={styles.title}>Venda por voz</Text>

          <Text style={styles.sectionLabel}>Você falou:</Text>
          <Text style={styles.transcript}>
            {parseResult?.transcript || "Sem texto reconhecido."}
          </Text>

          <Text style={styles.sectionLabel}>Entendi:</Text>
          {hasItems ? (
            <View style={styles.itemsContainer}>
              {parseResult?.items.map((item) => (
                <View key={item.productId} style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.productName}</Text>
                  <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>
              Não consegui identificar nenhum produto.
            </Text>
          )}

          {hasUnrecognized ? (
            <>
              <Text style={styles.sectionLabel}>Não reconhecido:</Text>
              <Text style={styles.unrecognized}>
                {parseResult?.unrecognized.join(", ")}
              </Text>
            </>
          ) : null}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>CANCELAR</Text>
            </TouchableOpacity>

            {hasItems ? (
              <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={2}
                  style={styles.confirmButtonText}
                >
                  ADICIONAR À VENDA
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.confirmButton} onPress={onRetry}>
                <Text style={styles.confirmButtonText}>TENTAR NOVAMENTE</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>, compact: boolean) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0, 0, 0, 0.48)",
      padding: compact ? 14 : 20,
    },

    modal: {
      width: "100%",
      maxWidth: 420,
      backgroundColor: colors.cardElevated,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      padding: compact ? 16 : 18,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.18,
      shadowRadius: 16,
      elevation: 8,
    },

    title: {
      color: colors.text,
      fontSize: compact ? 20 : 22,
      fontWeight: "800",
      lineHeight: compact ? 24 : 27,
      marginBottom: 12,
    },

    sectionLabel: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: "800",
      lineHeight: 17,
      marginTop: 10,
      marginBottom: 5,
    },

    transcript: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
      lineHeight: 22,
    },

    itemsContainer: {
      gap: 7,
    },

    itemRow: {
      minHeight: 42,
      borderRadius: 8,
      backgroundColor: colors.backgroundElement,
      paddingHorizontal: 12,
      paddingVertical: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },

    itemName: {
      flex: 1,
      color: colors.text,
      fontSize: 15,
      fontWeight: "700",
      lineHeight: 20,
    },

    itemQuantity: {
      color: colors.primary,
      fontSize: 17,
      fontWeight: "900",
      lineHeight: 21,
    },

    emptyText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "700",
      lineHeight: 21,
    },

    unrecognized: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 20,
    },

    actions: {
      flexDirection: "row",
      gap: 10,
      marginTop: 18,
    },

    cancelButton: {
      flex: 1,
      minHeight: 52,
      borderRadius: 8,
      backgroundColor: colors.mutedButton,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 8,
    },

    confirmButton: {
      flex: 1,
      minHeight: 52,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 8,
    },

    cancelButtonText: {
      color: colors.mutedButtonText,
      fontSize: 13,
      fontWeight: "900",
      lineHeight: 17,
      textAlign: "center",
    },

    confirmButtonText: {
      color: colors.primaryText,
      fontSize: 13,
      fontWeight: "900",
      lineHeight: 17,
      textAlign: "center",
    },
  });
}
