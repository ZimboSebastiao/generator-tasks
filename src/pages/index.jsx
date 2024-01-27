import Cabecalho from "@/components/layout/Cabecalho";
// import TaskGene from "@/components/task-generator";
import TaskGene from "@/components/task-generator";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Cabecalho />
      <TaskGene />
    </>
  );
}
