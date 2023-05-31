import { Link, useLoaderData, useNavigation } from "@remix-run/react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
export default function Pagination() {
  let data = useLoaderData();
  let textId = data.text.id;
  let order = data.page.order;

  let PreviousLink = `/text/${textId}/page/${order - 1}/posts`;
  let nextLink = `/text/${textId}/page/${order + 1}/posts`;

  return (
    <div className="flex justify-center gap-3">
      {order - 1 > 0 && (
        <Link to={PreviousLink} className="flex items-center gap-2">
          <FaArrowLeft />
          previous
        </Link>
      )}
      <Link to={nextLink} className="flex items-center gap-2">
        next
        <FaArrowRight />
      </Link>
    </div>
  );
}
