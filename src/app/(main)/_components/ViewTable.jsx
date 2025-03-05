import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { aggregateWeeklyData, getCurrentWeekRange } from "@/app/_utils/aggregateWeeklyData";

const ViewTable = ({ newsData }) => {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    // newsData가 존재할 때만 데이터를 집계하고, state를 갱신합니다.
    if (newsData && newsData.length > 0) {
      const { startOfWeek, endOfWeek } = getCurrentWeekRange();
      const aggregatedData = aggregateWeeklyData(newsData, startOfWeek, endOfWeek);
      setDepartments(aggregatedData);
    }
  }, [newsData]);

  return (
    <Card className="m-2 w-1/2">
      <CardHeader>
        <CardTitle>부서별 조회수 현황 Table</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>A list of your recent departments.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="">부서</TableHead>
              <TableHead>총 조회수</TableHead>
              <TableHead>기사 수</TableHead>
              <TableHead className="">평균 조회수</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell className="text-right">$2,500.00</TableCell>
            </TableRow> */}
            {departments.map((department) => (
              <TableRow key={department.department}>
                <TableCell className="font-medium">{department.department}</TableCell>
                <TableCell>{department.totalViews}</TableCell>
                <TableCell>{department.articleCount}</TableCell>
                <TableCell className="">{department.averageViews}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter></TableFooter>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between"></CardFooter>
    </Card>
  );
};

export default ViewTable;
