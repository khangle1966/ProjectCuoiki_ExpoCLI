import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthProvider";
import { InsertTables } from "@/app/types";
import { UpdateTables } from "@/app/types";

export const useAdminOrderList = ({ archived = false }) => {
  return useQuery({
    queryKey: ["orders", archived],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*") // Không cần liên kết với bảng profiles
        .order("created_at", { ascending: false }); // Sắp xếp theo thời gian tạo, mới nhất lên đầu

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    // Thêm options để tự động refresh
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 3000,
  });
};

export const useMyOrderList = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  });
};


export const useOrderDetails = (id: number) => {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*, products(*))")
        .eq("id", id)
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useAddOrders = () => {
  return useMutation({
    async mutationFn(data) {
      const { data: newOrder, error } = await supabase
        .from("orders")
        .insert({ ...data }) // Không cần thêm status mặc định
        .select()
        .single();

      if (error) {
        console.error("Error inserting order:", error);
        throw new Error(error.message);
      }
      return newOrder;
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    async mutationFn({ id, updatedField }: { id: number; updatedField: UpdateTables<'orders'> }) {
      const { data: updatedOrder, error } = await supabase
        .from("orders")
        .update(updatedField)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return updatedOrder;
    },
    async onSuccess(updatedOrder) {
      await queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["orders", updatedOrder.id],
      });
    },
  });
};

export const useInsertOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data) {
      const { error, data: newOrder } = await supabase
        .from("orders")
        .insert({ ...data }) // Không cần user_id
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return newOrder;
    },
    async onSuccess() {
      await queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
    },
  });
};
