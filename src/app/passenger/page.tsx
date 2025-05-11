import { Suspense } from "react";
import PassengerPageClient from "./PassengerPageClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingView } from "../../components/LoadingView";

export default function PassengerPage() {
  return (
    <Suspense fallback={<LoadingView />}>
      <PassengerPageClient />
    </Suspense>
  );
}
