import { OptionButton } from "@/components/general/OptionButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { getFormattedDate, toCap } from "@/lib/utils";
import type { ReportGroupBy, ReportItem } from "@/types/core";
import { Eye, Printer } from "lucide-react";
import { useRef, useState } from "react";
import { DataTable } from "./ViewEntityDialog";
import { useReactToPrint } from "react-to-print";

interface props{
    label: string
    groupBy: ReportGroupBy
    companyName: string
    reports: ReportItem[]   
}

function ViewBizsafeEntityReports({
    label,
    groupBy,
    companyName,
    reports
}: props) {
    const [openControl, setOpenControl] = useState(false)
    const printRef = useRef(null);

    const handlePrint = useReactToPrint({
        contentRef : printRef
    })
    return (
    <Dialog
        open = {openControl}
        onOpenChange={setOpenControl}
    >
        <DialogTrigger>
            <OptionButton
                Icon={Eye}
                label="View"
                className="w-fit"
            />
        </DialogTrigger>
        <DialogContent className="md:max-w-230 md:max-h-[90vh] overflow-y-auto bg-white text-gray-800">
            <div ref = {printRef}>
                <style type="text/css" media="print">{`
                    @page {
                        size: A4;
                        margin: 14mm 14mm 18mm 14mm;
                    }
                `}</style>
                <div className="flex justify-between mb-10">
                    <div>
                        <img src="/logo/logo.png" className="w-80 h-auto" alt="Fincheck Logo" />
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold">FINCHECK (PVT) LTD</h2>
                        <p className="text-sm text-gray-500">8th Floor Club Chambers</p>
                        <p className="text-sm text-gray-500">Corner Nelson Mandela and Third Street</p>
                        <p className="text-sm text-gray-500">Harare, Zimbabwe</p>
                        <p className="text-sm text-gray-500">VAT Number: 220191384</p>
                        <p className="text-sm text-gray-500">TIN: 2000032265</p>
                        <p className="text-sm text-gray-500">accounts@fincheckzim.com</p>
                        <p className="text-sm text-gray-500">(242)-704891/4</p>
                    </div>
                </div>
                <div className="flex flex-col gap-5">
                    <div>
                        <h2 className="font-bold uppercase">{companyName}</h2>
                        <h2 className="font-bold uppercase">Report list - {toCap(label)}</h2>
                    </div>

                    <DataTable 
                        size={"md"}
                        headers={["Enq Ref", groupBy === "client" ? "Subject" : "Client", "Report Date"]}>
                        {
                            reports.map((item, index) => (
                                <tr key={index} className="border-b border-gray-300 even:bg-gray-50">
                                    <td className="py-2.5 px-4">{item.enquiry_reference}</td>
                                    <td className="py-2.5 px-4">{item.name}</td>
                                    <td className="py-2.5 px-4">{getFormattedDate(item.report_date)}</td>
                                </tr>  
                            ))
                        }
                    </DataTable>
                </div>
            </div>
            <DialogFooter>
                <DialogClose>
                    <Button variant={"ghost"}>Cancel</Button>
                </DialogClose>
                <Button onClick={handlePrint}>
                    <Printer/>
                    Print
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}

export default ViewBizsafeEntityReports