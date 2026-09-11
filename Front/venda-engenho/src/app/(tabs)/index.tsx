import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SymbolView } from "expo-symbols";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ProductCard from "@/components/ProductCard";
import VoiceSaleModal from "@/components/VoiceSaleModal";
import { useSale } from "@/context/SaleContext";
import { useVoiceSaleRecognition } from "@/hooks/use-voice-sale-recognition";
import { useTheme } from "@/hooks/use-theme";
import { formatCurrency } from "@/utils/money";
import { parseVoiceCommand, type VoiceParseResult } from "@/utils/voiceParser";

export default function HomeScreen() {
  const {
    products,
    quantities,
    total,
    totalItems,
    settingsLoading,
    addProduct,
    addVoiceItems,
    removeProduct,
    clearProduct,
    updateProductQuantity,
  } = useSale();
  const colors = useTheme();
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const metrics = useMemo(() => {
    const veryShort = height < 680;
    const short = height < 760;
    const narrow = width < 360;

    return {
      horizontalPadding: narrow ? 12 : 16,
      topPadding: Math.max(
        insets.top + (veryShort ? 6 : short ? 10 : 14),
        veryShort ? 24 : 34
      ),
      bottomPadding: Math.max(insets.bottom ? 6 : 10, 6),
      headerMarginBottom: veryShort ? 8 : short ? 10 : 12,
      titleFont: veryShort ? 24 : 28,
      subtitleFont: veryShort ? 13 : 15,
      finishButtonHeight: veryShort ? 42 : 44,
      finishButtonPaddingHorizontal: narrow ? 10 : 14,
      finishButtonFont: narrow ? 12 : 13,
      productsMarginBottom: veryShort ? 8 : 12,
      summaryGap: narrow ? 8 : 12,
      summaryPaddingVertical: veryShort ? 10 : 13,
      summaryPaddingHorizontal: narrow ? 12 : 16,
      summaryLabelFont: veryShort ? 12 : 13,
      itemsSummaryWidth: narrow ? 54 : 72,
      itemsFont: veryShort ? 20 : 22,
      totalFont: veryShort ? 24 : narrow ? 25 : 28,
      voiceButtonWidth: narrow ? 74 : 88,
      voiceButtonHeight: veryShort ? 48 : 52,
      voiceButtonFont: narrow ? 10 : 11,
      voiceIconSize: veryShort ? 20 : 22,
    };
  }, [height, insets.bottom, insets.top, width]);
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);
  const router = useRouter();
  const [voiceParseResult, setVoiceParseResult] =
    useState<VoiceParseResult | null>(null);
  const voiceContextualStrings = useMemo(
    () =>
      products.flatMap((product) => [
        product.name,
        product.name.toLowerCase(),
      ]),
    [products]
  );

  const handleVoiceTranscript = useCallback(
    (transcript: string) => {
      setVoiceParseResult(parseVoiceCommand(transcript, products));
    },
    [products]
  );

  const handleVoiceFeedback = useCallback(
    ({ title, message }: { title: string; message: string }) => {
      Alert.alert(title, message);
    },
    []
  );

  const {
    isListening: isVoiceListening,
    isVoiceBusy,
    start: startVoiceSale,
    state: voiceState,
    stop: stopVoiceSale,
  } = useVoiceSaleRecognition({
    contextualStrings: voiceContextualStrings,
    onFeedback: handleVoiceFeedback,
    onTranscript: handleVoiceTranscript,
  });
  const voiceButtonDisabled = isVoiceBusy && !isVoiceListening;
  const voiceButtonLabel = isVoiceListening ? "Ouvindo..." : "Voz";
  const voiceButtonIconColor = isVoiceBusy ? colors.primaryText : colors.text;

  function changeQuantity(id: string, value: string) {
    const numericValue = value.replace(/[^0-9]/g, "");
    const quantity = numericValue === "" ? 0 : Number(numericValue);

    updateProductQuantity(id, quantity);
  }

  function finishSale() {
    if (total <= 0) {
      Alert.alert(
        "Carrinho vazio",
        "Adicione pelo menos um produto para continuar."
      );
      return;
    }

    router.push({
      pathname: "/pagamento",
      params: {
        total: total.toFixed(2),
      },
    });
  }

  function toggleVoiceSale() {
    if (isVoiceListening) {
      stopVoiceSale();
      return;
    }

    void startVoiceSale();
  }

  function cancelVoiceSale() {
    setVoiceParseResult(null);
  }

  function confirmVoiceSale() {
    if (!voiceParseResult?.items.length) {
      return;
    }

    addVoiceItems(
      voiceParseResult.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }))
    );
    setVoiceParseResult(null);
  }

  function retryVoiceSale() {
    setVoiceParseResult(null);
    void startVoiceSale();
  }

  if (settingsLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando configuracoes...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Venda</Text>
            <Text style={styles.subtitle}>Venda do Engenho</Text>
          </View>

          <TouchableOpacity style={styles.finishButton} onPress={finishSale}>
            <Text style={styles.finishButtonText}>FINALIZAR VENDA</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productsContainer}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={quantities[product.id] ?? 0}
              onAdd={() => addProduct(product.id)}
              onRemove={() => removeProduct(product.id)}
              onClear={() => clearProduct(product.id)}
              onChangeQuantity={(value) => changeQuantity(product.id, value)}
            />
          ))}
        </View>

        <View style={styles.bottomActionsRow}>
          <View style={styles.totalContainer}>
            <View style={styles.itemsSummary}>
              <Text style={styles.summaryLabel}>Itens</Text>
              <Text style={styles.totalItems}>{totalItems}</Text>
            </View>

            <View style={styles.totalSummary}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.72}
                numberOfLines={1}
                style={styles.totalValue}
              >
                {formatCurrency(total)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            accessibilityLabel={
              isVoiceListening
                ? "Parar venda por voz"
                : "Iniciar venda por voz"
            }
            accessibilityRole="button"
            activeOpacity={0.78}
            disabled={voiceButtonDisabled}
            onPress={toggleVoiceSale}
            style={[
              styles.voiceButton,
              isVoiceBusy && styles.voiceButtonActive,
              voiceButtonDisabled && styles.voiceButtonDisabled,
            ]}
          >
            <SymbolView
              fallback={
                <Text
                  style={[
                    styles.voiceFallbackIcon,
                    isVoiceBusy && styles.voiceFallbackIconActive,
                  ]}
                >
                  V
                </Text>
              }
              name={{ ios: "mic.fill", android: "mic", web: "mic" }}
              size={metrics.voiceIconSize}
              tintColor={voiceButtonIconColor}
            />

            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={[
                styles.voiceButtonText,
                isVoiceBusy && styles.voiceButtonTextActive,
              ]}
            >
              {voiceState === "processing" ? "..." : voiceButtonLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <VoiceSaleModal
        onCancel={cancelVoiceSale}
        onConfirm={confirmVoiceSale}
        onRetry={retryVoiceSale}
        parseResult={voiceParseResult}
        visible={voiceParseResult !== null}
      />
    </View>
  );
}

function createStyles(
  colors: ReturnType<typeof useTheme>,
  metrics: {
    horizontalPadding: number;
    topPadding: number;
    bottomPadding: number;
    headerMarginBottom: number;
    titleFont: number;
    subtitleFont: number;
    finishButtonHeight: number;
    finishButtonPaddingHorizontal: number;
    finishButtonFont: number;
    productsMarginBottom: number;
    summaryGap: number;
    summaryPaddingVertical: number;
    summaryPaddingHorizontal: number;
    summaryLabelFont: number;
    itemsSummaryWidth: number;
    itemsFont: number;
    totalFont: number;
    voiceButtonWidth: number;
    voiceButtonHeight: number;
    voiceButtonFont: number;
    voiceIconSize: number;
  }
) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },

    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
    },

    content: {
      flex: 1,
      paddingHorizontal: metrics.horizontalPadding,
      paddingTop: metrics.topPadding,
      paddingBottom: metrics.bottomPadding,
    },

    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: metrics.headerMarginBottom,
      gap: 10,
    },

    headerTextContainer: {
      flex: 1,
      minWidth: 0,
    },

    title: {
      fontSize: metrics.titleFont,
      lineHeight: metrics.titleFont + 4,
      fontWeight: "bold",
      color: colors.text,
    },

    subtitle: {
      fontSize: metrics.subtitleFont,
      lineHeight: metrics.subtitleFont + 3,
      color: colors.textSecondary,
      marginTop: 1,
    },

    productsContainer: {
      flex: 1,
      justifyContent: "space-between",
      marginBottom: metrics.productsMarginBottom,
    },

    bottomActionsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: metrics.summaryGap,
    },

    totalContainer: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 8,
      paddingVertical: metrics.summaryPaddingVertical,
      paddingHorizontal: metrics.summaryPaddingHorizontal,

      borderWidth: 1,
      borderColor: colors.border,
      elevation: 2,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: metrics.summaryGap,

      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },

    itemsSummary: {
      width: metrics.itemsSummaryWidth,
    },

    totalSummary: {
      flex: 1,
      alignItems: "flex-end",
    },

    summaryLabel: {
      fontSize: metrics.summaryLabelFont,
      lineHeight: metrics.summaryLabelFont + 3,
      fontWeight: "700",
      color: colors.textSecondary,
    },

    totalItems: {
      fontSize: metrics.itemsFont,
      lineHeight: metrics.itemsFont + 3,
      fontWeight: "800",
      color: colors.text,
      marginTop: 1,
    },

    voiceButton: {
      width: metrics.voiceButtonWidth,
      height: metrics.voiceButtonHeight,
      borderRadius: 8,
      backgroundColor: colors.backgroundElement,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
    },

    voiceButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    voiceButtonDisabled: {
      opacity: 0.72,
    },

    voiceButtonText: {
      color: colors.text,
      fontSize: metrics.voiceButtonFont,
      fontWeight: "900",
      lineHeight: metrics.voiceButtonFont + 3,
      textAlign: "center",
    },

    voiceButtonTextActive: {
      color: colors.primaryText,
    },

    voiceFallbackIcon: {
      color: colors.text,
      fontSize: metrics.voiceIconSize - 2,
      fontWeight: "900",
      lineHeight: metrics.voiceIconSize + 2,
    },

    voiceFallbackIconActive: {
      color: colors.primaryText,
    },

    totalValue: {
      fontSize: metrics.totalFont,
      lineHeight: metrics.totalFont + 4,
      fontWeight: "bold",
      color: colors.text,
      marginTop: 1,
    },

    finishButton: {
      height: metrics.finishButtonHeight,
      borderRadius: 8,
      backgroundColor: colors.primary,

      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: metrics.finishButtonPaddingHorizontal,
    },

    finishButtonText: {
      color: colors.primaryText,
      fontSize: metrics.finishButtonFont,
      fontWeight: "bold",
      lineHeight: metrics.finishButtonFont + 3,
    },
  });
}
