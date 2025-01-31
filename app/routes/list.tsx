import { LoaderArgs } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import Header from "~/component/Layout/Header";
import {useState} from 'react'
import { findAllTextWithDetail } from "~/model/text";
import { Avatar } from "~/component/UI";
import { getUserSession } from "~/services/session.server";
import { TextType } from "~/model/type";
import groupData from "~/lib/filterVersionFromText";
export const loader = async ({ request }: LoaderArgs) => { 
  let textList = await findAllTextWithDetail();
  let user = await getUserSession(request);
  return {
    textList,
    isAdmin: user?.admin==='true'
    };
}

export default function List() {
    const fetcher = useFetcher();
    const { textList,isAdmin } = useLoaderData();
    const [currentPage, setCurrentPage] = useState(1);
    const textsPerPage = 20;
    const indexOfLastText = currentPage * textsPerPage;
    const indexOfFirstText = indexOfLastText - textsPerPage;
    const currentTexts = textList.slice(indexOfFirstText, indexOfLastText);
    const totalPages = Math.ceil(textList.length / textsPerPage);
    const goToPage = (page:number) => {
      setCurrentPage(page);
  };
  
    const deleteText = (textId: number) => {
    let i=confirm('Are you sure you want to delete this text?')
   
    if (i) {
      fetcher.submit({ textId:textId.toString() }, {
        method: 'DELETE',
        action: `/api/text`,
      })
    } else {
      console.log('cancelled')
    }
    
    }


    return (
      <div>
        <Header editor={null} />
        <div className="h-20" />

        <h1 className="mx-auto max-w-xl text-center font-serif capitalize">List of Pechas</h1>
        <table className="mx-auto w-full max-w-4xl text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="border-b-2 border-gray-100 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-4 py-4">
                Title
              </th>
              <th scope="col" className="px-4 py-4">
                Total page
              </th>
            </tr>
          </thead>
          <tbody>
            {currentTexts.map((text: TextType) => {
              let { groupedData, isVersionAvailable } = groupData(text.Page);
              let url = `/text/${text.id}/page/1/${text.allow_post ? 'posts' : ''}`;

              return (
                <tr key={text.id} className="w-full border-b dark:border-gray-700">
                  <th scope="col" className="flex items-center gap-1 px-4 py-4" style={{ fontFamily: 'monlam' }}>
                    <Avatar
                      title={text?.author.name}
                      alt={text?.author.name}
                      img={text?.author.avatarUrl}
                      rounded={true}
                      size="sm"
                    />
                    <Link to={url}>{text.name}</Link>
                  </th>
                  <td scope="col" className=" px-4 py-4">
                    {!isVersionAvailable ? (
                      <div className="flex gap-2">
                        <div>{text.Page.length}</div>
                        {isAdmin && (
                          <div onClick={() => deleteText(text.id)} className="cursor-pointer">
                            delete
                          </div>
                        )}
                      </div>
                    ) : (
                        <div className="flex gap-2">
                        {Object.keys(groupedData).map((key) => {
                          let urlversion = url + '?version=' + key;
                          return (
                            <Link
                              key={key}
                              to={urlversion}
                              className="cursor-pointer rounded-md bg-yellow-300 px-2 capitalize text-black"
                            >
                              {key}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mt-8 flex items-center justify-center">
          <button
            onClick={() => goToPage(currentPage - 1)}
            className={`${currentPage === 1 && 'hidden'} mr-4 rounded-lg bg-gray-200 px-4 py-2 text-gray-700`}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => goToPage(index + 1)}
              className={`px-4 py-2 ${currentPage === 1 && 'hidden'} ${
                index + 1 === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              } mx-2 rounded-lg`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => goToPage(currentPage + 1)}
            className={` ${
              currentPage === totalPages && 'hidden'
            } ml-4 rounded-lg bg-gray-200 px-4 py-2 text-gray-700 `}
          >
            Next
          </button>
        </div>
      </div>
    );
}