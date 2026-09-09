import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function PagamentoScreen() {
  const router = useRouter();
  const { total } = useLocalSearchParams<{ total?: string }>();

  const totalFormatado = String(total ?? "0.00").replace(".", ",");

  function handlePayment(method: string) {
    Alert.alert(
      "Venda Concluída!",
      `Pagamento de R$ ${totalFormatado} recebido via ${method}.`,
      [
        {
          text: "OK",
          onPress: () => router.replace("/"),
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Finalizar Venda</Text>

      <Text style={styles.label}>Total da venda</Text>

      <Text style={styles.total}>R$ {totalFormatado}</Text>

      <Text style={styles.subtitle}>Escolha a forma de pagamento</Text>

      <TouchableOpacity
        style={styles.paymentButton}
        onPress={() => handlePayment("Dinheiro")}
      >
        <Text style={styles.paymentIcon}>💵</Text>
        <Text style={styles.paymentText}>DINHEIRO</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.paymentButton}
        onPress={() => handlePayment("PIX")}
      >
        <Text style={styles.paymentIcon}>📱</Text>
        <Text style={styles.paymentText}>PIX</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>VOLTAR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
    paddingTop: 60,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111",
  },

  label: {
    fontSize: 16,
    color: "#777",
    marginTop: 30,
  },

  total: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#111",
    marginTop: 5,
  },

  subtitle: {
    fontSize: 17,
    color: "#555",
    marginTop: 35,
    marginBottom: 15,
  },

  paymentButton: {
    height: 75,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 15,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 25,

    elevation: 2,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  paymentIcon: {
    fontSize: 30,
    marginRight: 20,
  },

  paymentText: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#111",
  },

  backButton: {
    height: 55,
    borderRadius: 14,
    backgroundColor: "#222",

    justifyContent: "center",
    alignItems: "center",

    marginTop: 20,
  },

  backText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});