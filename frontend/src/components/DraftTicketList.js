import React, { memo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTicket } from '../context/TicketContext';

/**
 * Draft Ticket List component
 * Displays a table of all draft job tickets
 */
const DraftTicketList = () => {
  const { language, translations } = useLanguage();
  const { draftTickets, setSelectedDraftTicket, setViewMode } = useTicket();
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-white">
            {translations.draftJobTickets}
          </h1>
          <p className="mt-2 text-sm text-gray-300">
            {translations.draftJobTicketsList}
          </p>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0">
                    {language === 'en' ? 'Job Date' : 'Fecha de Trabajo'}
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    {language === 'en' ? 'Company Name' : 'Nombre de la Empresa'}
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    {language === 'en' ? 'Description of Work' : 'Descripción del Trabajo'}
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    {language === 'en' ? 'Work Total Hours' : 'Horas Totales de Trabajo'}
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">{translations.view}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {draftTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                      {ticket.jobDate}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                      {ticket.companyName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                      {ticket.workDescription?.length > 30 
                        ? `${ticket.workDescription.substring(0, 30)}...` 
                        : ticket.workDescription}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                      {ticket.workTotalHours}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <button
                        onClick={() => {
                          setSelectedDraftTicket(ticket);
                          setViewMode('draft');
                        }}
                        className="text-orange-500 hover:text-orange-400"
                      >
                        {translations.view}
                      </button>
                    </td>
                  </tr>
                ))}
                {draftTickets.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-300">
                      {translations.noDraftJobTickets}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(DraftTicketList);
