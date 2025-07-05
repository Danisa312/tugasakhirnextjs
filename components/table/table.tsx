import {
  Table,
  Dropdown,
  Button,
  Spinner,
  Pagination,
} from "@nextui-org/react";
import React, { useState, useEffect } from "react";
import { Box } from "../styles/box";

export type Column = {
  name: string;
  uid: string;
  sortable?: boolean;
  render?: (row: any) => React.ReactNode;
};

type TableWrapperProps = {
  columns?: Column[];
  data?: any[];
  loading?: boolean;
  totalItems?: number;
  onDataChange?: (params: {
    page: number;
    limit: number;
    sortField: string | null;
    sortDirection: string;
  }) => void;
  limitOptions?: number[];
  defaultLimit?: number;
  defaultPage?: number;
  defaultSortField?: string | null;
  defaultSortDirection?: string;
  selectionMode?: "single" | "multiple";
  ariaLabel?: string;
  showLimitSelector?: boolean;
  showPagination?: boolean;
  showSorting?: boolean;
  [key: string]: any;
};

export const TableWrapper = ({
  columns = [],
  data = [],
  loading = false,
  totalItems = 0,
  onDataChange,
  limitOptions = [5, 10, 25, 50, 100],
  defaultLimit = 10,
  defaultPage = 1,
  defaultSortField = null,
  defaultSortDirection = "asc",
  selectionMode = "multiple",
  ariaLabel = "Data table with server-side pagination and sorting",
  showLimitSelector = true,
  showPagination = true,
  showSorting = true,
  showSelection = false,
  ...tableProps
}: TableWrapperProps) => {
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [limit, setLimit] = useState(defaultLimit);
  const [sortField, setSortField] = useState(defaultSortField);
  const [sortDirection, setSortDirection] = useState(defaultSortDirection);

  const totalPages = Math.ceil(totalItems / limit);

  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        page: currentPage,
        limit: limit,
        sortField: sortField,
        sortDirection: sortDirection,
      });
    }
  }, [currentPage, limit, sortField, sortDirection, onDataChange]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const handleSortChange = (columnKey: string) => {
    if (!showSorting) return;

    if (sortField === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(columnKey);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const getSortIcon = (columnKey: string) => {
    if (!showSorting || sortField !== columnKey) return null;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const renderLimitSelector = () => {
    if (!showLimitSelector) return null;

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginTop: "16px",
        }}
      >
        <span>Show:</span>
        <Dropdown>
          <Dropdown.Trigger>
            <Button auto light size="sm">
              {limit} <span style={{ marginLeft: "4px" }}>▼</span>
            </Button>
          </Dropdown.Trigger>
          <Dropdown.Menu
            aria-label="Limit options"
            onAction={(key) => handleLimitChange(Number(key))}
          >
            {limitOptions.map((option) => (
              <Dropdown.Item key={option}>{option}</Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <span>entries</span>
      </div>
    );
  };

  const renderPaginationInfo = () => {
    const startItem = (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, totalItems);

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "16px",
          fontSize: "14px",
          color: "#666",
        }}
      >
        <span>
          Showing {startItem} to {endItem} of {totalItems} entries
        </span>
        {totalPages > 1 && (
          <span>
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>
    );
  };

  return (
    <Box
      css={{
        "& .nextui-table-container": {
          boxShadow: "none",
        },
      }}
    >
      {renderLimitSelector()}

      <Table
        aria-label={ariaLabel}
        css={{
          height: "auto",
          minWidth: "100%",
          boxShadow: "none",
          width: "100%",
          px: 0,
        }}
        selectionMode={selectionMode}
        showSelectionCheckboxes={showSelection}
        {...tableProps}
      >
        <Table.Header columns={columns}>
          {(column) => (
            <Table.Column
              key={column.uid}
              hideHeader={column.uid === "actions"}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={showSorting && column.sortable !== false}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  cursor:
                    showSorting && column.sortable !== false
                      ? "pointer"
                      : "default",
                }}
                onClick={() => {
                  if (showSorting && column.sortable !== false) {
                    handleSortChange(column.uid);
                  }
                }}
              >
                {column.name}
                {getSortIcon(column.uid)}
              </div>
            </Table.Column>
          )}
        </Table.Header>

        <Table.Body items={data}>
          {loading ? (
            <Table.Row>
              {columns.map((_, idx) => (
                <Table.Cell key={idx} css={{ p: 0 }}>
                  {idx === 0 ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        padding: "12px 0",
                      }}
                    >
                      <Spinner />
                      <span style={{ marginLeft: "8px" }}>Loading...</span>
                    </div>
                  ) : null}
                </Table.Cell>
              ))}
            </Table.Row>
          ) : data.length > 0 ? (
            data.map((item) => (
              <Table.Row key={item.id || item.uid}>
                {columns.map((column) => (
                  <Table.Cell key={column.uid}>
                    {column.render
                      ? column.render(item) // ← gunakan render per kolom jika ada
                      : "-"}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))
          ) : (
            <Table.Row>
              {columns.map((_, idx) => (
                <Table.Cell key={idx}>
                  {idx === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#888",
                        width: "100%",
                        padding: "12px 0",
                      }}
                    >
                      No data available
                    </div>
                  ) : null}
                </Table.Cell>
              ))}
            </Table.Row>
          )}
        </Table.Body>
      </Table>

      {showPagination && totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "16px",
          }}
        >
          <Pagination
            shadow
            noMargin
            color="primary"
            page={currentPage}
            total={totalPages}
            onChange={setCurrentPage}
          />
        </div>
      )}

      {renderPaginationInfo()}
    </Box>
  );
};

export const useTableState = ({
  defaultPage = 1,
  defaultLimit = 10,
  defaultSortField = null,
  defaultSortDirection = "asc",
} = {}) => {
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [limit, setLimit] = useState(defaultLimit);
  const [sortField, setSortField] = useState(defaultSortField);
  const [sortDirection, setSortDirection] = useState(defaultSortDirection);

  const setSort = (field: any) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const setPage = (page: number) => setCurrentPage(page);
  const setRowsPerPage = (rows: number) => {
    setLimit(rows);
    setCurrentPage(1);
  };

  return {
    currentPage,
    setPage,
    limit,
    setRowsPerPage,
    sortField,
    sortDirection,
    setSort,
    setSortField,
    setSortDirection,
  };
};
