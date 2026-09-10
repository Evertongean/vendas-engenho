import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { useSale } from "@/context/SaleContext";
import { useTheme } from "@/hooks/use-theme";
import type { PaymentMethod } from "@/types/sale";
import {
  formatCurrency,
  formatCurrencyInput,
  parseCurrencyInput,
  roundCurrency,
} from "@/utils/money";

type PaymentStep = "selection" | PaymentMethod;

export default function PagamentoScreen() {
  const router = useRouter();
  const { items, total, clearSale, createSaleRecord, saveSale } = useSale();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>("selection");
  const [receivedValue, setReceivedValue] = useState("");
  const [saleCompleted, setSaleCompleted] = useState(false);
  const [isSavingSale, setIsSavingSale] = useState(false);

  const received = useMemo(
    () => parseCurrencyInput(receivedValue),
    [receivedValue]
  );
  const change = Math.max(roundCurrency(received - total), 0);
  const hasEnoughCash = total > 0 && received >= total;

  useEffect(() => {
    if (saleCompleted || items.length > 0) {
      return;
    }

    Alert.alert(
      "Venda vazia",
      "Adicione produtos antes de escolher o pagamento.",
      [
        {
          text: "OK",
          onPress: () => router.replace("/"),
        },
      ],
      { cancelable: false }
    );
  }, [items.length, router, saleCompleted]);

  async function finishConfirmedSale(paymentMethod: PaymentMethod) {
    if (isSavingSale) {
      return;
    }

    const saleRecord = createSaleRecord({
      paymentMethod,
      received: paymentMethod === "pix" ? total : received,
      change: paymentMethod === "pix" ? 0 : change,
    });

    try {
      setIsSavingSale(true);
      await saveSale(saleRecord);
      console.log("Venda finalizada:", saleRecord);
      setSaleCompleted(true);
      clearSale();

      Alert.alert(
        "Venda finalizada",
        "Venda finalizada com sucesso!",
        [
          {
            text: "OK",
            onPress: () => router.replace("/"),
          },
        ],
        { cancelable: false }
      );
    } catch {
      Alert.alert(
        "Erro ao salvar",
        "A venda nao foi finalizada porque nao foi possivel salvar no historico. Tente novamente."
      );
    } finally {
      setIsSavingSale(false);
    }
  }

  function goBack() {
    router.back();
  }

  function renderPaymentSelection() {
    return (
      <>
        <Text style={styles.subtitle}>Escolha a forma de pagamento</Text>

        <TouchableOpacity
          style={styles.paymentButton}
          onPress={() => setPaymentStep("dinheiro")}
        >
          <Text style={styles.paymentIcon}>R$</Text>
          <Text style={styles.paymentText}>DINHEIRO</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.paymentButton}
          onPress={() => setPaymentStep("pix")}
        >
          <Text style={styles.paymentIcon}>PIX</Text>
          <Text style={styles.paymentText}>PIX</Text>
        </TouchableOpacity>
      </>
    );
  }

  function renderCashPayment() {
    return (
      <>
        <Text style={styles.subtitle}>Pagamento em dinheiro</Text>

        <Text style={styles.fieldLabel}>Valor recebido</Text>

        <View style={styles.moneyInputContainer}>
          <Text style={styles.moneyPrefix}>R$</Text>
          <TextInput
            style={styles.moneyInput}
            value={receivedValue}
            onChangeText={setReceivedValue}
            onBlur={() => {
              if (receivedValue.trim()) {
                setReceivedValue(formatCurrencyInput(received));
              }
            }}
            keyboardType="decimal-pad"
            placeholder="0,00"
            placeholderTextColor={colors.textSecondary}
            selectTextOnFocus
          />
        </View>

        <Text style={styles.fieldLabel}>Troco</Text>

        {hasEnoughCash ? (
          <Text style={styles.changeValue}>{formatCurrency(change)}</Text>
        ) : (
          <Text style={styles.insufficientText}>Valor insuficiente</Text>
        )}

        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!hasEnoughCash || isSavingSale) && styles.disabledButton,
          ]}
          onPress={() => finishConfirmedSale("dinheiro")}
          disabled={!hasEnoughCash || isSavingSale}
        >
          <Text style={styles.confirmButtonText}>
            {isSavingSale ? "SALVANDO..." : "CONFIRMAR VENDA"}
          </Text>
        </TouchableOpacity>
      </>
    );
  }

  function renderPixPayment() {
    return (
      <>
        <Text style={styles.subtitle}>Pagamento via PIX</Text>

        <View style={styles.pixInfoContainer}>
          <Text style={styles.pixLabel}>Total</Text>
          <Text style={styles.pixTotal}>{formatCurrency(total)}</Text>
          <Text style={styles.pixHelp}>
            Confirme apos receber o PIX do cliente.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.confirmButton, isSavingSale && styles.disabledButton]}
          onPress={() => finishConfirmedSale("pix")}
          disabled={isSavingSale}
        >
          <Text style={styles.confirmButtonText}>
            {isSavingSale ? "SALVANDO..." : "PAGAMENTO RECEBIDO"}
          </Text>
        </TouchableOpacity>
      </>
    );
  }

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
        <Text style={styles.title}>Finalizar Venda</Text>

        <Text style={styles.label}>Total da venda</Text>

        <Text style={styles.total}>{formatCurrency(total)}</Text>

        {paymentStep === "selection" && renderPaymentSelection()}
        {paymentStep === "dinheiro" && renderCashPayment()}
        {paymentStep === "pix" && renderPixPayment()}

        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backText}>VOLTAR</Text>
        </TouchableOpacity>
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

    content: {
      flexGrow: 1,
      padding: 20,
      paddingTop: 60,
      paddingBottom: 40,
    },

    title: {
      fontSize: 30,
      fontWeight: "bold",
      color: colors.text,
    },

    label: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 30,
    },

    total: {
      fontSize: 38,
      fontWeight: "bold",
      color: colors.text,
      marginTop: 5,
    },

    subtitle: {
      fontSize: 17,
      color: colors.textSecondary,
      marginTop: 35,
      marginBottom: 15,
    },

    paymentButton: {
      height: 75,
      backgroundColor: colors.card,
      borderRadius: 8,
      marginBottom: 15,

      flexDirection: "row",
      alignItems: "center",

      paddingHorizontal: 25,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 2,

      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },

    paymentIcon: {
      width: 54,
      fontSize: 18,
      fontWeight: "bold",
      color: colors.primary,
      marginRight: 10,
    },

    paymentText: {
      fontSize: 19,
      fontWeight: "bold",
      color: colors.text,
    },

    fieldLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textSecondary,
      marginTop: 12,
      marginBottom: 8,
    },

    moneyInputContainer: {
      height: 68,
      backgroundColor: colors.inputBackground,
      borderRadius: 8,
      paddingHorizontal: 18,

      flexDirection: "row",
      alignItems: "center",

      borderWidth: 1,
      borderColor: colors.border,
      elevation: 2,

      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },

    moneyPrefix: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginRight: 10,
    },

    moneyInput: {
      flex: 1,
      fontSize: 28,
      fontWeight: "bold",
      color: colors.text,
      padding: 0,
    },

    changeValue: {
      fontSize: 34,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 20,
    },

    insufficientText: {
      fontSize: 22,
      fontWeight: "bold",
      color: colors.danger,
      marginBottom: 24,
    },

    pixInfoContainer: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 20,
      marginBottom: 20,

      borderWidth: 1,
      borderColor: colors.border,
      elevation: 2,

      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },

    pixLabel: {
      fontSize: 16,
      color: colors.textSecondary,
    },

    pixTotal: {
      fontSize: 34,
      fontWeight: "bold",
      color: colors.text,
      marginTop: 4,
    },

    pixHelp: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 22,
      marginTop: 16,
    },

    confirmButton: {
      height: 58,
      borderRadius: 8,
      backgroundColor: colors.primary,

      justifyContent: "center",
      alignItems: "center",

      marginBottom: 12,
    },

    disabledButton: {
      backgroundColor: colors.disabled,
    },

    confirmButtonText: {
      color: colors.primaryText,
      fontSize: 16,
      fontWeight: "bold",
    },

    backButton: {
      height: 55,
      borderRadius: 8,
      backgroundColor: colors.secondaryButton,

      justifyContent: "center",
      alignItems: "center",

      marginTop: 8,
    },

    backText: {
      color: colors.secondaryButtonText,
      fontSize: 16,
      fontWeight: "bold",
    },
  });
}
