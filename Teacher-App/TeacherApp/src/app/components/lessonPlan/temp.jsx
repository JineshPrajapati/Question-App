<TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
        <TableCell>
          <b>{formatTitle}</b>
        </TableCell>
        <TableCell>
          <b>Start Date</b>
        </TableCell>
        <TableCell>
          <b>End Date</b>
        </TableCell>
        <TableCell>
          <b>Domain Title</b>
        </TableCell>
        <TableCell>
          <b>Topics</b>
        </TableCell>
        <TableCell>
          <b>Standards</b>
        </TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {lessonPlanList.map((gp, index) => (
        <TableRow key={index}>
          <TableCell>{gp.Period}</TableCell>
          <TableCell>
            {gp.Start_Date ? dayjs(gp.Start_Date).format("DD MMM YYYY") : "-"}
          </TableCell>
          <TableCell>
            {gp.End_Date ? dayjs(gp.End_Date).format("DD MMM YYYY") : "-"}
          </TableCell>
          <TableCell>{gp.Domain_Title}</TableCell>
          <TableCell>
            {gp.Topics.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {gp.Topics.map((topic, tIdx) => (
                  <li key={tIdx}>{topic}</li>
                ))}
              </ul>
            ) : (
              "-"
            )}
          </TableCell>
          <TableCell>
            {gp.Standards.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {gp.Standards.map((std, sIdx) => (
                  <li key={sIdx}>{std}</li>
                ))}
              </ul>
            ) : (
              "-"
            )}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>;
