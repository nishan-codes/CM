"use client";
import exportToExcel from "@/components/Export";
import { ComicText } from "@/components/magicui/comic-text";
import { Button } from "@/components/ui/button";
import { GradientText } from "@/components/ui/gradient-text";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSearchStore } from "@/lib/store";

const Page = () => {
  const { storedLibrary } = useSearchStore();

  return (
    <div
      className={`flex flex-1 flex-col gap-5 pt-14 md:pt-19 pb-5 px-5 sm:px-6 lg:px-8`}
    >
      <div className="flex gap-3 items-center justify-between">
        <h1 className="text-md sm:text-xl lg:text-3xl bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
          <GradientText
            colors={[
              "oklch(71.5% 0.143 215.221)",
              "oklch(62.3% 0.214 259.815)",
              "#000",
            ]}
            animationSpeed={5}
            className="font-semibold"
          >
            Your Stored Links
          </GradientText>
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            exportToExcel(storedLibrary);
          }}
          className={storedLibrary.length > 0 ? "" : "hidden"}
        >
          Export to excel
        </Button>
      </div>
      <Table>
        {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>URL</TableHead>
            {/*<TableHead>Engaged Views</TableHead>
            <TableHead>Likes</TableHead>
            <TableHead>Shares</TableHead>
            <TableHead className="text-right">Subscribers Gained</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {storedLibrary.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{item.title}</TableCell>
              {/* <TableCell>{invoice.paymentStatus}</TableCell>
              <TableCell>{invoice.paymentMethod}</TableCell>
              <TableCell>{invoice.totalAmount}</TableCell>
              <TableCell className="font-medium">{invoice.invoice}</TableCell>
              <TableCell className="text-right">
                {invoice.paymentStatus}
              </TableCell> */}
              <TableCell className="font-medium">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {item.url}
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell>{storedLibrary.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default Page;
