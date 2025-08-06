import Dashboard from "@/components/Dashboard";

export default async function Page() {
  // 👇 this line forces a delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return <Dashboard />;
}



