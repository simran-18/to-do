import { GrFormPrevious } from "react-icons/gr";
import { GrFormNext } from "react-icons/gr";
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getVisiblePages = () => {
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage === 1) {
      return [1, 2, 3];
    } else if (currentPage === totalPages) {
      return [totalPages - 2, totalPages - 1, totalPages];
    } else {
      return [currentPage - 1, currentPage, currentPage + 1];
    }
  };

  return (
    <div className="flex gap-2 justify-center my-4 items-center w-full">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 bg-gray-400 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <GrFormPrevious size={20}/>
      </button>

      {getVisiblePages().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`py-2 px-4 cursor-pointer rounded ${
            page === currentPage
              ? "bg-blue-600 text-white font-bold"
              : "bg-white hover:bg-gray-100"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
       <GrFormNext size={20}/>
      </button>
    </div>
  );
};

export default Pagination;
