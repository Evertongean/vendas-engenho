import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useSettings } from "@/context/SettingsContext";
import { useTheme } from "@/hooks/use-theme";
import type { PixSettings, ProductPriceMap } from "@/types/settings";
import {
  formatCurrencyInput,
  parseCurrencyInputStrict,
} from "@/utils/money";

type PriceErrors = Record<string, string>;

export default function ConfiguracoesScreen() {
  const {
    pixSettings,
    products,
    themeMode,
    settingsLoading,
    savePixSettings,
    saveProductPrices,
    setThemeMode,
  } = useSettings();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [draftPriceOverrides, setDraftPriceOverrides] = useState<
    Record<string, string>
  >({});
  const [draftPixOverrides, setDraftPixOverrides] = useState<
    Partial<PixSettings>
  >({});
  const [priceErrors, setPriceErrors] = useState<PriceErrors>({});
  const [pixStatusMessage, setPixStatusMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSavingPixSettings, setIsSavingPixSettings] = useState(false);
  const [isSavingPrices, setIsSavingPrices] = useState(false);
  const [isSavingTheme, setIsSavingTheme] = useState(false);

  const savedDraftPrices = useMemo(
    () =>
      products.reduce<Record<string, string>>((prices, product) => {
        prices[product.id] = formatCurrencyInput(product.unitPrice);
        return prices;
      }, {}),
    [products]
  );
  const draftPrices = useMemo(
    () => ({
      ...savedDraftPrices,
      ...draftPriceOverrides,
    }),
    [draftPriceOverrides, savedDraftPrices]
  );

  const draftPixSettings = useMemo(
    () => ({
      ...pixSettings,
      ...draftPixOverrides,
    }),
    [draftPixOverrides, pixSettings]
  );

  function updateDraftPrice(id: string, value: string) {
    setDraftPriceOverrides((current) => ({
      ...current,
      [id]: value,
    }));
    setPriceErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors[id];
      return nextErrors;
    });
    setStatusMessage("");
  }

  function formatDraftPrice(id: string) {
    const parsedPrice = parseCurrencyInputStrict(draftPrices[id] ?? "");

    if (parsedPrice === undefined) {
      return;
    }

    setDraftPriceOverrides((current) => ({
      ...current,
      [id]: formatCurrencyInput(parsedPrice),
    }));
  }

  async function savePrices() {
    const nextPrices: ProductPriceMap = {};
    const nextErrors: PriceErrors = {};

    products.forEach((product) => {
      const parsedPrice = parseCurrencyInputStrict(draftPrices[product.id] ?? "");

      if (parsedPrice === undefined) {
        nextErrors[product.id] = "Informe um valor valido.";
        return;
      }

      nextPrices[product.id] = parsedPrice;
    });

    if (Object.keys(nextErrors).length > 0) {
      setPriceErrors(nextErrors);
      setStatusMessage("");
      Alert.alert("Preco invalido", "Revise os valores destacados.");
      return;
    }

    try {
      setIsSavingPrices(true);
      await saveProductPrices(nextPrices);
      setDraftPriceOverrides({});
      setStatusMessage("Precos atualizados com sucesso.");
    } catch {
      Alert.alert(
        "Erro ao salvar",
        "Nao foi possivel salvar os precos. Tente novamente."
      );
    } finally {
      setIsSavingPrices(false);
    }
  }

  function updateDraftPixSetting(field: keyof PixSettings, value: string) {
    setDraftPixOverrides((current) => ({
      ...current,
      [field]: value,
    }));
    setPixStatusMessage("");
  }

  async function savePixConfiguration() {
    try {
      setIsSavingPixSettings(true);
      await savePixSettings(draftPixSettings);
      setDraftPixOverrides({});
      setPixStatusMessage("Configuracao PIX salva com sucesso.");
    } catch {
      Alert.alert(
        "Erro ao salvar",
        "Nao foi possivel salvar a configuracao PIX. Tente novamente."
      );
    } finally {
      setIsSavingPixSettings(false);
    }
  }

  async function toggleTheme(isDark: boolean) {
    try {
      setIsSavingTheme(true);
      await setThemeMode(isDark ? "dark" : "light");
    } catch {
      Alert.alert(
        "Erro ao salvar",
        "Nao foi possivel salvar o tema. Tente novamente."
      );
    } finally {
      setIsSavingTheme(false);
    }
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

  const isDarkTheme = themeMode === "dark";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Configuracoes</Text>
        </View>

        <Text style={styles.sectionTitle}>PRODUTOS E PRECOS</Text>

        <View style={styles.productList}>
          {products.map((product) => (
            <View key={product.id} style={styles.productRow}>
              <View style={styles.productTextContainer}>
                <Text style={styles.productName}>{product.name}</Text>
                {priceErrors[product.id] ? (
                  <Text style={styles.errorText}>{priceErrors[product.id]}</Text>
                ) : null}
              </View>

              <View
                style={[
                  styles.priceInputContainer,
                  priceErrors[product.id] && styles.priceInputError,
                ]}
              >
                <Text style={styles.moneyPrefix}>R$</Text>
                <TextInput
                  style={styles.priceInput}
                  value={draftPrices[product.id] ?? ""}
                  onChangeText={(value) => updateDraftPrice(product.id, value)}
                  onBlur={() => formatDraftPrice(product.id)}
                  keyboardType="decimal-pad"
                  placeholder="0,00"
                  placeholderTextColor={colors.textSecondary}
                  selectTextOnFocus
                />
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            isSavingPrices && styles.disabledButton,
          ]}
          onPress={savePrices}
          disabled={isSavingPrices}
        >
          <Text style={styles.saveButtonText}>
            {isSavingPrices ? "SALVANDO..." : "SALVAR ALTERACOES"}
          </Text>
        </TouchableOpacity>

        {statusMessage ? (
          <Text style={styles.statusText}>{statusMessage}</Text>
        ) : null}

        <View style={styles.sectionSpacer} />

        <Text style={styles.sectionTitle}>CONFIGURACAO PIX</Text>

        <View style={styles.pixSettingsContainer}>
          <Text style={styles.inputLabel}>Chave PIX</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="default"
            onChangeText={(value) => updateDraftPixSetting("pixKey", value)}
            placeholder="CPF, CNPJ, telefone, email ou chave aleatoria"
            placeholderTextColor={colors.textSecondary}
            style={styles.textInput}
            value={draftPixSettings.pixKey}
          />

          <Text style={styles.inputLabel}>Nome do recebedor</Text>
          <TextInput
            autoCapitalize="words"
            onChangeText={(value) =>
              updateDraftPixSetting("pixMerchantName", value)
            }
            placeholder="Nome que aparecera no PIX"
            placeholderTextColor={colors.textSecondary}
            style={styles.textInput}
            value={draftPixSettings.pixMerchantName}
          />

          <Text style={styles.inputLabel}>Cidade</Text>
          <TextInput
            autoCapitalize="words"
            onChangeText={(value) =>
              updateDraftPixSetting("pixMerchantCity", value)
            }
            placeholder="Cidade do recebedor"
            placeholderTextColor={colors.textSecondary}
            style={styles.textInput}
            value={draftPixSettings.pixMerchantCity}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            isSavingPixSettings && styles.disabledButton,
          ]}
          onPress={savePixConfiguration}
          disabled={isSavingPixSettings}
        >
          <Text style={styles.saveButtonText}>
            {isSavingPixSettings ? "SALVANDO..." : "SALVAR PIX"}
          </Text>
        </TouchableOpacity>

        {pixStatusMessage ? (
          <Text style={styles.statusText}>{pixStatusMessage}</Text>
        ) : null}

        <View style={styles.sectionSpacer} />

        <Text style={styles.sectionTitle}>APARENCIA</Text>

        <View style={styles.themeRow}>
          <Text
            style={[
              styles.themeOption,
              !isDarkTheme && styles.themeOptionActive,
            ]}
          >
            Claro
          </Text>

          <Switch
            value={isDarkTheme}
            onValueChange={toggleTheme}
            disabled={isSavingTheme}
            thumbColor={isDarkTheme ? colors.primary : colors.card}
            trackColor={{
              false: colors.backgroundElement,
              true: colors.tabActiveBackground,
            }}
          />

          <Text
            style={[
              styles.themeOption,
              isDarkTheme && styles.themeOptionActive,
            ]}
          >
            Escuro
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>) {
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
      padding: 20,
      paddingTop: 60,
      paddingBottom: 34,
    },

    header: {
      marginBottom: 24,
    },

    title: {
      fontSize: 30,
      fontWeight: "bold",
      color: colors.text,
    },

    sectionTitle: {
      fontSize: 15,
      fontWeight: "800",
      color: colors.textSecondary,
      marginBottom: 12,
    },

    productList: {
      gap: 10,
    },

    pixSettingsContainer: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: 14,
      gap: 8,
    },

    productRow: {
      minHeight: 72,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },

    productTextContainer: {
      flex: 1,
    },

    productName: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
    },

    errorText: {
      color: colors.danger,
      fontSize: 13,
      marginTop: 4,
    },

    priceInputContainer: {
      width: 132,
      height: 46,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.inputBackground,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
    },

    priceInputError: {
      borderColor: colors.danger,
    },

    moneyPrefix: {
      color: colors.textSecondary,
      fontSize: 15,
      fontWeight: "700",
      marginRight: 6,
    },

    priceInput: {
      flex: 1,
      padding: 0,
      color: colors.text,
      fontSize: 17,
      fontWeight: "700",
      textAlign: "right",
    },

    inputLabel: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "800",
      marginTop: 4,
    },

    textInput: {
      minHeight: 48,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.inputBackground,
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
      paddingHorizontal: 12,
      paddingVertical: 8,
    },

    saveButton: {
      height: 54,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 16,
    },

    disabledButton: {
      backgroundColor: colors.disabled,
    },

    saveButtonText: {
      color: colors.primaryText,
      fontSize: 16,
      fontWeight: "bold",
    },

    statusText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: "700",
      marginTop: 12,
    },

    sectionSpacer: {
      height: 34,
    },

    themeRow: {
      minHeight: 64,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    themeOption: {
      fontSize: 17,
      color: colors.textSecondary,
      fontWeight: "700",
    },

    themeOptionActive: {
      color: colors.primary,
    },
  });
}
