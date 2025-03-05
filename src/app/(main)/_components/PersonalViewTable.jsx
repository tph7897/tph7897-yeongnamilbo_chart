import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentWeekRange, personalWeeklyData } from "@/app/_utils/personalWeeklyData";

const PersonalViewTable = ({ newsData }) => {
  // console.log("newsData", newsData);
  const [gijas, setGijas] = useState([]);

  useEffect(() => {
    const { startOfWeek, endOfWeek } = getCurrentWeekRange();

    const result = personalWeeklyData(newsData, startOfWeek, endOfWeek);
    setGijas(result);
    console.log("data", result);
  }, [newsData]);

  return (
    <Card className="m-2 w-1/2">
      <CardHeader>
        <CardTitle>기자별 조회수 현황 Table</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          {/* <TableCaption>A list of your recent departments.</TableCaption> */}
          <TableHeader>
            <TableRow>
              <TableHead className="">부서</TableHead>
              <TableHead className="">이름</TableHead>
              <TableHead>총 조회수</TableHead>
              <TableHead>기사 수</TableHead>
              <TableHead className="">평균</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gijas.map((department) => (
              <TableRow key={department.department}>
                <TableCell className="font-medium">{department.department}</TableCell>
                <TableCell>{department.reporter}</TableCell>
                <TableCell>{department.totalViews}</TableCell>
                <TableCell className="">{department.articleCount}</TableCell>
                <TableCell className="">{department.averageViews}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          {/* <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell className="">$2,500.00</TableCell>
            </TableRow>
          </TableFooter> */}
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between"></CardFooter>
    </Card>
  );
};

export default PersonalViewTable;
