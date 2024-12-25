import { CartItem,PizzaSize, Tables } from '@/app/types';
import { PropsWithChildren, createContext, useContext, useState } from 'react';
import { randomUUID } from 'expo-crypto';
import { useInsertOrder } from '@/api/orders';
import { useRouter } from 'expo-router';
import { useInsertOrderItems } from '@/api/order-items';
import { Alert } from 'react-native';
import { useAddOrders } from "@/api/orders";
import { supabase } from '@/lib/supabase';


type Product = Tables<'products'>;

type CartType = {
  items: CartItem[];
  addItem: (product: Product, size: PizzaSize) => void;
  updateQuantity: (itemId: string, amount: -1 | 1) => void;
  getTotalCartAmount: () => number;
  checkout: () => void;
};

const CartContext = createContext<CartType>({
  items: [],
  addItem: () => {},
  updateQuantity: () => {},
  getTotalCartAmount: () => 0,
  checkout: () => {},
});

const CartProvider = ({ children }: PropsWithChildren) => {
  const [items, setItems] = useState<CartItem[]>([]); // Giỏ hàng
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const { mutate: insertOrder } = useInsertOrder(); // API để thêm đơn hàng
  const { mutate: insertOrderItems } = useInsertOrderItems(); // API để thêm các item vào đơn hàng
  const router = useRouter();
  const { mutate: addOrder } = useAddOrders();
  const [seatNumber, setSeatNumber] = useState<string | null>(null); // Ghế đã chọn


  const updateSeatNumber = (seat: string) => {
    setSeatNumber(seat); // Cập nhật ghế
  };

   // Thêm hàm removeItem
   const removeItem = (itemId: string) => {
    setItems((currentItems) => 
      currentItems.filter((item) => item.id !== itemId)
    );
  };

  
  // Thêm sản phẩm vào giỏ hàng
  const addItem = (product: Product, size: CartItem['size']) => {
    const existingItem = items.find(
      (item) => item.product.id === product.id && item.size === size
    );

    if (existingItem) {
      updateQuantity(existingItem.id, 1);
      return;
    }

    const newCartItem: CartItem = {
      id: randomUUID(),
      product,
      product_id: product.id,
      size,
      quantity: 1,
    };

    setItems([newCartItem, ...items]);
  };

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  const updateQuantity = (itemId: string, amount: -1 | 1) => {
    setItems(
      items
        .map((item) =>
          item.id !== itemId
            ? item
            : { ...item, quantity: item.quantity + amount }
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Tính tổng giá trị giỏ hàng
  const getTotalCartAmount = () => {
    return items.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );
  };

  // Xóa giỏ hàng
  const clearCart = () => {
    setItems([]);
  };

  // Hàm thanh toán (checkout)
  const checkout = async () => {
    const total = getTotalCartAmount();
  
    if (!seatNumber) {
      Alert.alert("Chưa chọn ghế", "Vui lòng chọn ghế ngồi trước khi thanh toán.");
      return;
    }
  
    if (items.length === 0) {
      Alert.alert("Giỏ hàng trống", "Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.");
      return;
    }
  
    const user = supabase.auth.user(); // Lấy thông tin user từ Supabase
  
    if (!user) {
      Alert.alert("Error", "Không tìm thấy thông tin người dùng.");
      return;
    }
  
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          total,
          status: 'New',
          seat_number: seatNumber,
          user_id: user.id, // Thêm user_id
        })
        .single();
  
      if (error) throw error;
  
      const orderItems = items.map((item) => ({
        order_id: data.id,
        product_id: item.product_id,
        quantity: item.quantity,
        size: item.size,
      }));
  
      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
  
      if (orderItemsError) throw orderItemsError;
  
      console.log("Order and items added successfully");
      setItems([]);
      setSeatNumber(null);
      router.push(`/(user)/orders/${data.id}`);
    } catch (error) {
      console.error("Error during checkout:", error.message);
    }
  };
  
  
  

  
  

  // Tổng giá trị giỏ hàng
  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        total,
        getTotalCartAmount,
        checkout,
        removeItem,
        clearCart,
        seatNumber,
        updateSeatNumber,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;

// Hook sử dụng CartContext
export const useCart = () => useContext(CartContext);
