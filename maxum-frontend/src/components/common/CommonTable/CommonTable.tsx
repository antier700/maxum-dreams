import { memo, type ReactNode } from "react";
import { Col, Placeholder, Row, Table } from "react-bootstrap";
import { NoRecordIcon, SortIcon } from "../../../assets/icons/svgIcon";
import "./CommonTable.scss";
import CustomPagination from "../ui/CustomPagination/CustomPagination";

type TProps = {
  children?: ReactNode;
  fields: ({ label: string | React.ReactNode; key: string })[];
  loader?: boolean;
  tableTitle?: string;
  tableRightContent?: ReactNode;
  lastColumnWidth?: string;
  className?: string;
  filterBtn?: boolean;
  pagination?: boolean;
  onPageChange?: (selectedItem: { selected: number }) => void;
  totalPages?: number;
  totalDocs?: number;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
};

const CommonTable = (props: TProps) => {
  return (
    <>
      <div className={`table_box ${props.className}`}>
        {props.tableTitle && (
          <div className="table_box_head">
            <Row className="align-items-center">
              <Col>
                <h4 className="table_heading">{props.tableTitle}</h4>
              </Col>
              {props.tableRightContent && (
                <Col className="text-end">{props.tableRightContent}</Col>
              )}
            </Row>
          </div>
        )}

        <Table responsive>
          {props.fields && (
            <thead>
              <tr>
                {props.fields.map((field, index) => {
                  const isLast = index === props.fields.length - 1;
                  const isSorted = props.sortKey === field.key;
                  const sortIndicator =
                    isSorted && props.sortOrder && (
                      <span className={`sort-icon ${props.sortOrder}`}>
                        <SortIcon />
                      </span>
                    );

                  return (
                    <th
                      key={field.key}
                      onClick={() => props.onSort?.(field.key)}
                      style={{
                        // userSelect: "none",
                        ...(isLast
                          ? {
                            width: props.lastColumnWidth,
                            minWidth: props.lastColumnWidth,
                          }
                          : {}),
                      }}
                    >
                      <span>{field.label}</span>
                      {isSorted && (
                        <span className="sort-indicator" >
                          {sortIndicator}
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

          )}

          <tbody>
            {props?.loader ? (
              [...Array(4)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {props.fields.map((_, colIndex) => (
                    <td key={colIndex}>
                      <Placeholder as="p" animation="glow">
                        <Placeholder xs={12} />
                      </Placeholder>
                    </td>
                  ))}
                </tr>
              ))
            ) : props.children ? (
              props.children
            ) : (
              <tr>
                <td colSpan={props.fields.length} className="no_record_box">
                  <NoRecordIcon />
                  <p>No Record Found</p>
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {props.pagination && (
          <CustomPagination
            pageCount={props?.totalPages ?? 1}
            handlePageChange={props?.onPageChange}
            totalDocs={props?.totalDocs ?? 0}
          />
        )}
      </div>
    </>
  );
};

export default memo(CommonTable);
