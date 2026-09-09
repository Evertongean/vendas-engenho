import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";

const products = [
  {
    id: "1",
    name: "Mel",
    price: 12,
  },
  {
    id: "2",
    name: "Rapadura",
    price: 8,
  },
  {
    id: "3",
    name: "Rapadura Temperada",
    price: 10,
  },
  {
    id: "4",
    name: "Batida",
    price: 5,
  },
  {
    id: "5",
    name: "Caldo de Cana",
    price: 7,
  },
];

export default function HomeScreen() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const router = useRouter();

  function addProduct(id: string) {
    setQuantities((current) => ({
      ...current,
      [id]: (current[id] ?? 0) + 1,
    }));
  }

  function removeProduct(id: string) {
    setQuantities((current) => ({
      ...current,
      [id]: Math.max((current[id] ?? 0) - 1, 0),
    }));
  }

  function changeQuantity(id: string, value: string) {
    const numericValue = value.replace(/[^0-9]/g, "");

    const quantity = numericValue === "" ? 0 : Number(numericValue);

    setQuantities((current) => ({
      ...current,
      [id]: quantity,
    }));
  }

  function calculateTotal() {
    return products.reduce((total, product) => {
      const quantity = quantities[product.id] ?? 0;

      return total + product.price * quantity;
    }, 0);
  }

  function calculateTotalItems() {
    return products.reduce((total, product) => {
      return total + (quantities[product.id] ?? 0);
    }, 0);
  }

  function clearSale() {
    setQuantities({});
  }

  function finishSale() {
    const total = calculateTotal();

    if (total <= 0) {
      Alert.alert(
        "Carrinho vazio",
        "Adicione pelo menos um produto para continuar."
      );
      return;
    }

    router.push(`/pagamento?total=${total.toFixed(2)}`);
  }

  return (
    <View style={styles.container}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Venda do Engenho</Text>

        <Text style={styles.subtitle}>Controle de vendas</Text>

        {products.map((product) => (
          <View key={product.id} style={styles.card}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>

              <Text style={styles.productPrice}>
                R$ {product.price.toFixed(2)}
              </Text>
            </View>

            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => removeProduct(product.id)}
              >
                <Text style={styles.buttonText}>−</Text>
              </TouchableOpacity>

              <TextInput
                style={styles.quantityInput}
                value={String(quantities[product.id] ?? 0)}
                onChangeText={(value) => changeQuantity(product.id, value)}
                keyboardType="number-pad"
                selectTextOnFocus
              />

              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => addProduct(product.id)}
              >
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>TOTAL DA VENDA</Text>

          <Text style={styles.totalItems}>
            {calculateTotalItems()}{" "}
            {calculateTotalItems() === 1 ? "item" : "itens"}
          </Text>

          <Text style={styles.totalValue}>
            R$ {calculateTotal().toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity style={styles.finishButton} onPress={finishSale}>
          <Text style={styles.finishButtonText}>FINALIZAR VENDA</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearButton} onPress={clearSale}>
          <Text style={styles.clearButtonText}>ZERAR VENDA</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111",
  },

  subtitle: {
    fontSize: 16,
    color: "#777",
    marginTop: 5,
    marginBottom: 25,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    elevation: 2,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  productInfo: {
    flex: 1,
    paddingRight: 10,
  },

  productName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111",
  },

  productPrice: {
    fontSize: 16,
    color: "#555",
    marginTop: 6,
  },

  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#eeeeee",

    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    fontSize: 28,
    color: "#111",
  },

  quantityInput: {
    fontSize: 24,
    fontWeight: "600",
    width: 50,
    textAlign: "center",
    color: "#111",
    padding: 0,
    marginHorizontal: 8,
  },

  totalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    marginBottom: 15,

    elevation: 2,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },

  totalItems: {
    fontSize: 15,
    color: "#777",
    marginTop: 4,
  },

  totalValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111",
    marginTop: 5,
  },

  finishButton: {
    height: 55,
    borderRadius: 14,
    backgroundColor: "#4CAF50",

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 12,
  },

  finishButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  clearButton: {
    height: 55,
    borderRadius: 14,
    backgroundColor: "#222",

    justifyContent: "center",
    alignItems: "center",
  },

  clearButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});