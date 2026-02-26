import React, { createContext, useCallback, useContext, useState } from "react";
import { supabase } from "../lib/supabase";
import type { OrderHistoryItem } from "../components/home/OrderHistoryCard";

export interface OrderDetailData {
  restaurantName: string;
  address: string | null;
  // array of objects
  lineItems: {
    quantity: number;
    price_at_time_of_purchase: number;
    name: string;
  }[];
}

interface OrderDetailCacheContextValue {
  getCached: (orderId: string) => OrderDetailData | null;
  setCached: (orderId: string, data: OrderDetailData) => void;
  // load order for that user
  fetchOrderDetail: (
    orderId: string,
    userId: string
  ) => Promise<{ data: OrderDetailData } | { error: string }>;
  fetchOrderList: (userId: string) => Promise<{ data: OrderHistoryItem[] } | { error: string }>;
}

const OrderDetailCacheContext = createContext<OrderDetailCacheContextValue | undefined>(undefined);

export function useOrderDetailCache() {
  // cache API context for (getCached, setCached, fetchOrderDetail)
  const ctx = useContext(OrderDetailCacheContext);
  // not inside correct provider
  if (ctx === undefined) {
    throw new Error("useOrderDetailCache must be used within OrderDetailCacheProvider");
  }
  return ctx;
}

// used for single order details
async function fetchOrderDetailImpl(
  orderId: string,
  userId: string
): Promise<{ data: OrderDetailData } | { error: string }> {
  // orders filtered by id and customer_id
  // only need restaurant_id
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("restaurant_id")
    .eq("id", orderId)
    .eq("customer_id", userId)
    .maybeSingle();

  if (orderErr || !order) {
    return { error: orderErr?.message ?? "Order not found." };
  }

  const rid = (order as { restaurant_id: string }).restaurant_id;

  // fetch restaurant_name, address, and populate lineItems (takes advantage of the fact that menu_items comes back as an array)
  const [restRes, locRes, itemsRes] = await Promise.all([
    supabase.from("restaurants").select("name").eq("id", rid).single(),
    supabase.from("locations").select("address_text").eq("restaurant_id", rid).maybeSingle(),
    // using fk to get menu_items(name)
    supabase
      .from("order_items")
      .select("quantity, price_at_time_of_purchase, menu_items(name)")
      .eq("order_id", orderId),
  ]);

  // set data
  const restaurantName = (restRes.data as { name: string } | null)?.name ?? "Restaurant";
  const address = (locRes.data as { address_text: string | null } | null)?.address_text ?? null;

  // make empty or confirming that the array of objects is shaped like so
  const items = (itemsRes.data ?? []) as {
    quantity: number;
    price_at_time_of_purchase: number;
    // is array of object ... or null
    menu_items: { name: string }[] | null;
  }[];

  // create formatted object to return
  const lineItems = items.map((i) => {
    const menuItem = Array.isArray(i.menu_items) ? i.menu_items[0] : i.menu_items;
    return {
      quantity: i.quantity,
      price_at_time_of_purchase: i.price_at_time_of_purchase,
      name: menuItem?.name ?? "Item",
    };
  });

  return {
    data: { restaurantName, address, lineItems },
  };
}

function formatOrderDate(createdAt: string): string {
  const d = new Date(createdAt);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}

// used for list or orders
async function fetchOrderListImpl(
  userId: string
): Promise<{ data: OrderHistoryItem[] } | { error: string }> {

  // load orders from the current user
  const { data, error: fetchError } = await supabase
    .from("orders")
    .select("id, restaurant_id, created_at, total_amount, status, order_number")
    .eq("customer_id", userId)
    .order("created_at", { ascending: false });

  if (fetchError) {
    return { error: fetchError.message };
  }

  // handle no orders
  const orderRows = data ?? [];
  if (orderRows.length === 0) {
    return { data: [] };
  }

  // load item count for the orders
  const orderIds = orderRows.map((r: { id: string }) => r.id);
  const { data: itemsData } = await supabase
    .from("order_items")
    .select("order_id, quantity")
    .in("order_id", orderIds);

  const itemCountByOrderId: Record<string, number> = {};
  for (const row of itemsData ?? []) {
    const r = row as { order_id: string; quantity: number };
    itemCountByOrderId[r.order_id] = (itemCountByOrderId[r.order_id] ?? 0) + Number(r.quantity);
  }

  // build and set the list state
  const list = orderRows.map(
    (row: {
      id: string;
      restaurant_id: string;
      created_at: string;
      total_amount: number;
      status?: string | null;
      order_number?: number | null;
    }) => ({
      id: row.id,
      restaurantId: row.restaurant_id,
      date: formatOrderDate(row.created_at),
      totalPrice: Number(row.total_amount),
      itemCount: itemCountByOrderId[row.id] ?? 0,
      status: row.status ?? undefined,
      orderNumber: row.order_number ?? undefined,
    })
  );
  return { data: list };
}

// re-render is the function call to this
export default function OrderDetailCacheProvider({ children }: { children: React.ReactNode }) {
  // this is what is cached
  const [cache, setCache] = useState<Record<string, OrderDetailData>>({});

  // get cached order_id if it exists
  // useCallback -> Recreate this function whenever cache changes 
  // (need new function to point to new cache object)
  const getCached = useCallback(
    (orderId: string) => cache[orderId] ?? null,
    // when cache changes it know to look at the new one
    [cache]
  );

  // update state by adding a new order, we never loose the already existing orders cached data
  // same function reference entire time
  const setCached = useCallback((orderId: string, data: OrderDetailData) => {
    setCache((prev) => ({ ...prev, [orderId]: data }));
  }, []);

  // just calls the function
  // same function reference entire time
  const fetchOrderDetail = useCallback(
    async (orderId: string, userId: string) => fetchOrderDetailImpl(orderId, userId),
    []
  );

  // no caching, list is refetched when needed
  // same function reference entire time
  const fetchOrderList = useCallback(async (userId: string) => fetchOrderListImpl(userId), []);

  const value = React.useMemo(
    () => ({ getCached, setCached, fetchOrderDetail, fetchOrderList }),
    [getCached, setCached, fetchOrderDetail, fetchOrderList]
  );

  return (
    <OrderDetailCacheContext.Provider value={value}>
      {children}
    </OrderDetailCacheContext.Provider>
  );
}
