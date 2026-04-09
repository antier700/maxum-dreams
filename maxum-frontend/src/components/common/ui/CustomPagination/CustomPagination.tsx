import { useState } from "react";
import { Col, Row } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import {
  PaginationNexxtIcon,
  PaginationPrevIcon,
} from "../../../../assets/icons/svgIcon";
import "./CustomPagination.scss";

interface PaginateEvent {
  selected: number;
}

interface CustomPaginationProps {
  limit?: number;
  className?: string;
  handlePageChange?: (selectedItem: { selected: number }) => void;
  pageCount?: number;
  totalDocs?: number;
  /** 0-based current page; when set, pagination is controlled by the parent */
  pageIndex?: number;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  limit = 5,
  className,
  handlePageChange,
  pageCount,
  totalDocs,
  pageIndex: controlledPageIndex,
}) => {
  const [internalPage, setInternalPage] = useState(1);
  const isControlled = controlledPageIndex !== undefined;
  const currentPage = isControlled ? controlledPageIndex + 1 : internalPage;

  const onPageChanged = (event: PaginateEvent) => {
    if (!isControlled) {
      setInternalPage(event?.selected + 1);
    }
    handlePageChange?.(event);
  };
  return (
    <div className={`custompagination ${className}`}>
      <Row className="align-items-center">
        <Col lg={6} className="custompagination_left">
          <p>
            {(totalDocs ?? 0) === 0
              ? "No entries"
              : `Showing data ${(currentPage - 1) * limit + 1} to ${Math.min(
                  currentPage * limit,
                  totalDocs ?? 0
                )} of ${totalDocs} entries`}
          </p>
        </Col>
        <Col lg={6} className="custompagination_left">
          <ReactPaginate
            previousLabel={<PaginationPrevIcon />}
            nextLabel={<PaginationNexxtIcon />}
            breakLabel="..."
            pageCount={pageCount ?? 1}
            forcePage={isControlled ? controlledPageIndex : undefined}
            onPageChange={onPageChanged}
            containerClassName="pagination"
            breakClassName="page-item"
            breakLinkClassName="page-link"
            pageClassName="page-item"
            pageLinkClassName="page-link"
            previousClassName="prevArrow"
            previousLinkClassName="page-link"
            nextClassName="nextArrow"
            nextLinkClassName="page-link"
            activeClassName="active"
          />
        </Col>
      </Row>
    </div>
  );
};

export default CustomPagination;
