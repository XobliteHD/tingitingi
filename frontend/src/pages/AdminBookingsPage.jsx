import React, { useState, useEffect, useCallback } from 'react';
import { format as formatTz } from 'date-fns-tz';
import { addDays } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import DatePicker from "react-datepicker";
import { Link, useNavigate } from 'react-router-dom';
import "react-datepicker/dist/react-datepicker.css";
import './datepicker-custom.css';
import './AdminCommon.css';
import toast from 'react-hot-toast';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { FaCalendarAlt, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import {
    fetchAdminBookings,
    updateAdminBookingStatus,
    deleteAdminBooking,
    updateAdminBookingDetails,
    fetchPublicHouseBookedDates
} from '../utils/api';

const CustomDateInput = React.forwardRef(
  ({ value, onClick, placeholder, id, className }, ref) => (
      <button
          className={className || 'input'}
          type="button"
          onClick={onClick}
          ref={ref}
          id={id}
          style={{ textAlign: 'left', justifyContent: 'flex-start', width: '100%' }}
      >
          {value ? value : <span style={{ opacity: 0.6 }}>{placeholder}</span>}
      </button>
  )
);
CustomDateInput.displayName = 'CustomDateInput';

export default function AdminBookingsPage({ t }) {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLocale, setCurrentLocale] = useState(enUS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [modalData, setModalData] = useState({
    name: '', email: '', phone: '', checkIn: null, checkOut: null,
    adults: 1, children: 0, status: 'Pending', message: '', houseId: ''
  });
  const [modalBookedDatesInfo, setModalBookedDatesInfo] = useState([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [isSavingModal, setIsSavingModal] = useState(false);
  const [modalError, setModalError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [limit] = useState(15);
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const navigate = useNavigate();

  useEffect(() => {
     const lang = localStorage.getItem('language') || 'en';
     setCurrentLocale(lang === 'fr' ? fr : enUS);
   }, []);

  const loadBookings = useCallback(async (page = 1, status = '', search = '', currentSortBy = 'createdAt_desc') => {
        setIsLoading(true);
        setError(null);
        try {
            const params = { page, limit, status, search, sortBy: currentSortBy };
            const data = await fetchAdminBookings(params);
            if (data && data.bookings) {
                 setBookings(data.bookings);
                 setCurrentPage(data.page);
                 setTotalPages(data.pages);
                 setTotalBookings(data.total);
            } else {
                setBookings([]);
                setCurrentPage(1);
                setTotalPages(1);
                setTotalBookings(0);
            }
        } catch (err) {
            if (err.message === "Unauthorized" || err.message === "Authentication required.") {
                 toast.error(t('authenticationRequired', { default: "Authentication required. Redirecting..."}));
                 setTimeout(() => navigate('/admin/login'), 1500);
            } else {
                 setError(err.message || t('adminBookingsFetchError', { default: 'Failed to fetch bookings' }));
            }
        } finally {
            setIsLoading(false);
        }
    }, [navigate, t, limit]);

  useEffect(() => {
      loadBookings(currentPage, filterStatus, searchTerm, sortBy);
  }, [currentPage, filterStatus, searchTerm, sortBy, loadBookings]);

  const formatDate = (dateString, formatKey = 'dateOnly') => {
    if (!dateString) return t('adminBookingsNotAvailable') || 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date)) throw new Error("Invalid date value");

        const timeZone = 'Africa/Tunis';
        let formatString = 'PP';

        if (formatKey === 'dateTime') {
             formatString = 'PPp';
        } else if (formatKey === 'isoDateOnly') {
             formatString = 'yyyy-MM-dd';
        }

        return formatTz(date, formatString, { locale: currentLocale, timeZone });

    } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return t('adminBookingsInvalidDate') || 'Invalid Date';
    }
  };

  const handleUpdateStatus = (bookingId, newStatus) => {
    setError(null);
    const performUpdate = async () => {
      try {
          const responseData = await updateAdminBookingStatus(bookingId, newStatus);
          toast.success(responseData?.message || t('adminBookingUpdateStatusSuccess', { status: newStatus, default: `Booking status updated to ${newStatus}` }));
          loadBookings(currentPage, filterStatus, searchTerm, sortBy);
      } catch (err) {
           if (err.message === "Unauthorized") {
               toast.error(t('authenticationRequired', { default: "Authentication required. Redirecting..."}));
               setTimeout(() => navigate('/admin/login'), 1500);
           } else {
               toast.error(t('adminBookingUpdateStatusError', { message: err.message, default:`Error updating status: ${err.message}` }));
               setError(`Failed to update booking ${bookingId}: ${err.message}`);
           }
      }
    };
    if (newStatus === 'Cancelled') {
      confirmAlert({
        title: t('adminConfirmCancelTitle', { default: 'Confirm Cancellation' }),
        message: t('adminConfirmCancel', { default: `Are you sure you want to cancel booking ${bookingId}?` }),
        buttons: [
          { label: t('adminConfirmYesCancel', { default: 'Yes, Cancel Booking' }), onClick: performUpdate },
          { label: t('adminConfirmNo', { default: 'No' }), onClick: () => {} }
        ]
      });
    } else {
      performUpdate();
    }
  };

  const handleDeleteClick = (bookingId) => {
    setError(null);
    confirmAlert({
        title: t('adminConfirmDeleteTitle', { default: 'Confirm Deletion' }),
        message: t('adminConfirmDelete', { default: `Are you sure you want to permanently delete this booking? This action is irreversible.` }),
        buttons: [
            {
                label: t('adminConfirmYes', { default: 'Yes, Delete' }),
                onClick: async () => {
                    try {
                        const responseData = await deleteAdminBooking(bookingId);
                        toast.success(responseData?.message || t('adminBookingDeleteSuccess', { default: `Booking ${bookingId} deleted.` }));
                        const newTotalPages = Math.ceil((totalBookings - 1) / limit);
                        const newCurrentPage = (currentPage > newTotalPages && newTotalPages > 0) ? newTotalPages : currentPage;
                        loadBookings(newCurrentPage, filterStatus, searchTerm, sortBy);
                    } catch (err) {
                        if (err.message === "Unauthorized") {
                             toast.error(t('authenticationRequired', { default: "Authentication required. Redirecting..."}));
                             setTimeout(() => navigate('/admin/login'), 1500);
                        } else {
                            toast.error(t('adminBookingDeleteError', { message: err.message, default: `Error deleting booking: ${err.message}` }));
                            setError(`Failed to delete booking ${bookingId}: ${err.message}`);
                        }
                    }
                }
            },
            { label: t('adminConfirmNo', { default: 'No, Cancel' }), onClick: () => {} }
        ]
    });
  };

  const fetchModalBookedDates = async (houseIdForModal, currentBookingId) => {
    if (!houseIdForModal) return;
    setIsModalLoading(true); setModalBookedDatesInfo([]); setModalError('');
    try {
      const data = await fetchPublicHouseBookedDates(houseIdForModal);
      const formattedData = data.filter(interval => interval.bookingId !== currentBookingId).map(interval => ({
          start: new Date(interval.start), end: new Date(interval.end), status: interval.status
      }));
      setModalBookedDatesInfo(formattedData);
    } catch (err) {
      setModalError(`Could not load availability: ${err.message}`);
      toast.error(`Could not load availability: ${err.message}`);
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleEditClick = (booking) => {
    setEditingBooking(booking);
    setModalData({
      name: booking.name || '', email: booking.email || '', phone: booking.phone || '',
      checkIn: booking.checkIn ? new Date(booking.checkIn) : null,
      checkOut: booking.checkOut ? new Date(booking.checkOut) : null,
      adults: booking.adults || 1, children: booking.children || 0,
      status: booking.status || 'Pending', message: booking.message || '', houseId: booking.houseId
    });
    setModalError(''); setIsModalOpen(true);
    fetchModalBookedDates(booking.houseId, booking._id);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); setEditingBooking(null);
    setModalData({ name: '', email: '', phone: '', checkIn: null, checkOut: null, adults: 1, children: 0, status: 'Pending', message: '', houseId: '' });
    setModalBookedDatesInfo([]); setModalError('');
  };

  const handleModalInputChange = (event) => { setModalData(prev => ({ ...prev, [event.target.name]: event.target.value })); };
  const handleModalStartDateChange = (date) => { setModalData(prev => ({ ...prev, checkIn: date, checkOut: (prev.checkOut && date && prev.checkOut <= date) ? null : prev.checkOut })); };
  const handleModalEndDateChange = (date) => { setModalData(prev => ({ ...prev, checkOut: date })); };
  const handleModalAdultsChange = (event) => { setModalData(prev => ({ ...prev, adults: Math.max(1, parseInt(event.target.value, 10) || 1) })); };
  const handleModalChildrenChange = (event) => { setModalData(prev => ({ ...prev, children: Math.max(0, parseInt(event.target.value, 10) || 0) })); };
  const getModalDayClassName = (date) => {
    const dayOnly = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    for (const interval of modalBookedDatesInfo) {
      const intervalStart = new Date(interval.start);
      const intervalEnd = new Date(interval.end);
      const startOnly = Date.UTC(intervalStart.getFullYear(), intervalStart.getMonth(), intervalStart.getDate());
      const endDayExclusive = Date.UTC(intervalEnd.getFullYear(), intervalEnd.getMonth(), intervalEnd.getDate());
      if (dayOnly >= startOnly && dayOnly < endDayExclusive) {
           return interval.status === 'Confirmed' ? "confirmedDay" : "pendingDay";
      }
  }
  return '';
 };
 const modalConfirmedIntervals = modalBookedDatesInfo
 .filter(interval => interval.status === 'Confirmed')
 .map(({ start, end }) => {
     const checkInDayStart = new Date(start);
     checkInDayStart.setUTCHours(0,0,0,0);
     const checkOutDayStart = new Date(end);
     checkOutDayStart.setUTCHours(0,0,0,0);
     const lastBlockedDay = addDays(checkOutDayStart, -1);
     if (checkInDayStart > lastBlockedDay) {
         console.warn("Skipping invalid interval for exclusion:", {start, end});
         return null;
     }
     return { start: checkInDayStart, end: lastBlockedDay };
 }).filter(interval => interval !== null);

  const handleModalSave = async () => {
      if (!editingBooking) return;
      setIsSavingModal(true); setModalError('');
      let validationErrors = {};
      if (!modalData.name.trim()) validationErrors.modalName = t('errorNameRequired');
      if (!modalData.email.trim()) validationErrors.modalEmail = t('errorEmailRequired');
      else if (!/\S+@\S+\.\S+/.test(modalData.email)) validationErrors.modalEmail = t('errorEmailInvalid');
      if (!modalData.phone.trim()) validationErrors.modalPhone = t('errorPhoneRequired');
      if (!modalData.checkIn) validationErrors.modalCheckIn = t('errorStartDateRequired');
      if (!modalData.checkOut) validationErrors.modalCheckOut = t('errorEndDateRequired');
      else if (modalData.checkIn && modalData.checkOut <= modalData.checkIn) validationErrors.modalCheckOut = t('errorEndDateAfterStart');
      if (modalData.adults < 1) validationErrors.modalAdults = t('errorAdultsMin');

      if (Object.keys(validationErrors).length > 0) {
          const firstError = Object.values(validationErrors)[0];
          setModalError(t('adminEditModalValidationError', { default: 'Please fix errors:' }) + ` ${firstError}`);
          setIsSavingModal(false); return;
      }

      const updateData = {
        name: modalData.name, email: modalData.email, phone: modalData.phone,
        checkIn: modalData.checkIn ? modalData.checkIn.toISOString() : null,
        checkOut: modalData.checkOut ? modalData.checkOut.toISOString() : null,
        adults: modalData.adults, children: modalData.children,
        status: modalData.status, message: modalData.message,
      };
       if (!updateData.checkIn) delete updateData.checkIn;
       if (!updateData.checkOut) delete updateData.checkOut;

      try {
        const responseData = await updateAdminBookingDetails(editingBooking._id, updateData);
        handleCloseModal();
        toast.success(responseData?.message || t('adminBookingEditSuccess', { default: 'Booking updated successfully!' }));
        loadBookings(currentPage, filterStatus, searchTerm, sortBy);
      } catch (err) {
        if (err.message === "Unauthorized") {
             toast.error(t('authenticationRequired', { default: "Authentication required. Redirecting..."}));
             setTimeout(() => navigate('/admin/login'), 1500);
        } else {
            setModalError(err.message || 'Failed to save changes.');
            toast.error(err.message || t('adminBookingEditError', { default: 'Failed to save changes.' }));
        }
      } finally {
        setIsSavingModal(false);
      }
  };

   const handleFilterChange = (event) => { setFilterStatus(event.target.value); setCurrentPage(1); };
   const handleSearchChange = (event) => { setSearchTerm(event.target.value); setCurrentPage(1); };
   const handlePageChange = (newPage) => { if (newPage >= 1 && newPage <= totalPages) { setCurrentPage(newPage); } };

   const handleSortChange = (field) => {
    let newSortBy;
    const currentDirection = sortBy.endsWith('_asc') ? 'asc' : 'desc';
    const currentField = sortBy.split('_')[0];
    if (field === currentField) { newSortBy = `${field}_${currentDirection === 'asc' ? 'desc' : 'asc'}`; }
    else { newSortBy = `${field}_desc`; }
    setSortBy(newSortBy); setCurrentPage(1);
    };
    const getSortIcon = (field) => {
    const currentField = sortBy.split('_')[0];
    const currentDirection = sortBy.endsWith('_asc') ? 'asc' : 'desc';
    if (field === currentField) { return currentDirection === 'asc' ? <FaSortUp /> : <FaSortDown />; }
    return <FaSort />;
  };

  if (isLoading && bookings.length === 0) { return <div className="admin-page-container">{t('loading')}</div>; }
  if (error && bookings.length === 0) { return <div className="notification is-danger is-light">{t('adminBookingsFetchErrorBase') || 'Error fetching bookings:'} {error}</div>; }

  return (
    <div className={"admin-page-container"}>
      <h1 className={`title is-3 admin-page-title`}>{t('adminBookingsTitle')}</h1>
        <div className="admin-page-actions" style={{ justifyContent: 'flex-start' }}>
            <Link to="/admin/dashboard" className="button is-link is-light is-small">
              ← {t('adminBackToDashboard')}
            </Link>
        </div>
       {error && !isModalOpen && <div className="notification is-danger is-light mb-4">{error} <button onClick={() => setError(null)} className="delete"></button></div>}

      <div className="columns is-variable is-2 mb-4">
          <div className="column is-half">
              <div className="field">
                  <label className="label is-small">{t('filterByStatus', { default: 'Filter by Status:'})}</label>
                  <div className="control">
                      <div className="select is-fullwidth is-small">
                          <select value={filterStatus} onChange={handleFilterChange}>
                              <option value="">{t('statusAll')}</option>
                              <option value="Pending">{t('bookingStatusPending')}</option>
                              <option value="Confirmed">{t('bookingStatusConfirmed')}</option>
                              <option value="Cancelled">{t('bookingStatusCancelled')}</option>
                              <option value="Completed">{t('bookingStatusCompleted')}</option>
                          </select>
                      </div>
                  </div>
              </div>
          </div>
          <div className="column is-half">
              <div className="field">
                   <label className="label is-small">{t('searchByNameEmailId')}</label>
                  <div className="control">
                      <input
                          className="input is-small"
                          type="text"
                          placeholder={t('searchPlaceholder')}
                          value={searchTerm}
                          onChange={handleSearchChange}
                      />
                  </div>
              </div>
          </div>
      </div>

      {isLoading && <p>{t('loading')}...</p>}
      {!isLoading && bookings.length === 0 ? ( <p>{t('adminBookingsNoneFound')}</p> ) : !isLoading && (
        <>
        <div className="table-container">
          <table className={`table is-striped is-hoverable is-fullwidth admin-table-responsive`}>
            <thead>
              <tr>
                <th>{t('adminBookingsHeaderStatus')}</th>
                <th>{t('adminBookingsHeaderHouse')}</th>
                <th>{t('adminBookingsHeaderName')}</th>
                <th>{t('adminBookingsHeaderEmail')}</th>
                <th>{t('adminBookingsHeaderPhone')}</th>
                <th>
                  <button className="button is-small is-ghost p-0" onClick={() => handleSortChange('createdAt')}>
                    {t('adminBookingsHeaderReceived')} <span className="icon is-small ml-1">{getSortIcon('createdAt')}</span>
                  </button>
                </th>
                <th>{t('adminBookingsHeaderActions')}</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td data-label={t('adminBookingsHeaderStatus')}><span className={ `tag status-tag ${ booking.status === 'Confirmed' ? 'is-success' : booking.status === 'Pending' ? 'is-warning' : booking.status === 'Cancelled' ? 'is-danger' : 'is-light'}` }>{t(`bookingStatus${booking.status}`)}</span></td>
                  <td data-label={t('adminBookingsHeaderHouse')}>{booking.houseId}</td>
                  <td data-label={t('adminBookingsHeaderName')}>{booking.name}</td>
                  <td data-label={t('adminBookingsHeaderEmail')}>{booking.email}</td>
                  <td data-label={t('adminBookingsHeaderPhone')}>{booking.phone}</td>
                  <td data-label={t('adminBookingsHeaderReceived')}>{formatDate(booking.createdAt, 'dateTime')}</td>
                  <td data-label={t('adminBookingsHeaderActions')}>
                    <div className="buttons are-small">
                      <button className="button is-link is-outlined" onClick={() => handleEditClick(booking)} title={t('adminBookingsActionEditTooltip')}><span>{t('adminBookingsActionEdit')}</span></button>
                      {(booking.status === 'Pending' || booking.status === 'Confirmed') && (<button className="button is-danger is-outlined" onClick={() => handleUpdateStatus(booking._id, 'Cancelled')} title={t('adminBookingsActionCancelTooltip')}><span>{t('adminBookingsActionCancel')}</span></button>)}
                      <button className="button is-danger is-outlined" onClick={() => handleDeleteClick(booking._id)} title={t('adminBookingsActionDeleteTooltip')}><span>{t('adminBookingsActionDelete')}</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <nav className="pagination is-centered is-small mt-5" role="navigation" aria-label="pagination">
            <button className="pagination-previous" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}> {t('paginationPrevious')} </button>
            <button className="pagination-next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}> {t('paginationNext')} </button>
            <ul className="pagination-list">
                <li> <span className="pagination-link has-text-weight-semibold" aria-current="page"> {t('paginationPageInfo', { currentPage: currentPage, totalPages: totalPages, default: `Page ${currentPage} of ${totalPages}` })} </span> </li>
            </ul>
            <div className="is-size-7 has-text-grey" style={{ marginLeft: 'auto', alignSelf: 'center' }}> {t('paginationTotalItems', { total: totalBookings, default: `Total: ${totalBookings}` })} </div>
        </nav>
       </>
      )}

        <div className={`modal ${isModalOpen ? 'is-active' : ''}`}>
            <div className="modal-background" onClick={handleCloseModal}></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">{t('adminEditModalTitle')}</p>
                    <button className="delete" aria-label="close" onClick={handleCloseModal}></button>
                </header>
                <section className="modal-card-body">
                    {modalError && (<div className="notification is-danger is-light mb-4"><button className="delete" onClick={() => setModalError('')}></button>{modalError}</div>)}
                    {isModalLoading && <p>{t('loading')}</p>}
                    {!isModalLoading && editingBooking && (
                    <div className="content">
                        <p><strong>{t('adminEditModalBookingId')}</strong> {editingBooking._id}</p>
                        <p><strong>{t('adminEditModalHouseId')}</strong> {editingBooking.houseId}</p>
                        <hr/>
                        <div className="field"><label className="label">{t('formName')}</label><div className="control"><input className="input" type="text" name="name" value={modalData.name} onChange={handleModalInputChange} /></div></div>
                        <div className="field"><label className="label">{t('formEmail')}</label><div className="control"><input className="input" type="email" name="email" value={modalData.email} onChange={handleModalInputChange} /></div></div>
                        <div className="field"><label className="label">{t('formPhone')}</label><div className="control"><input className="input" type="tel" name="phone" value={modalData.phone} onChange={handleModalInputChange} /></div></div>
                        <div className="columns">
                            <div className="column">
                              <div className="field"><label className="label">{t('formCheckIn')}</label>
                                <div className="control has-icons-left"><DatePicker selected={modalData.checkIn} onChange={handleModalStartDateChange} selectsStart startDate={modalData.checkIn} endDate={modalData.checkOut} minDate={new Date()} dateFormat="dd/MM/yyyy" excludeDateIntervals={modalConfirmedIntervals} dayClassName={getModalDayClassName} customInput={ <CustomDateInput id={`modal-checkin-date`} placeholder={t('formSelectDate')} className={`input`} /> } /><span className="icon is-left"><FaCalendarAlt /></span></div>
                              </div>
                            </div>
                              <div className="column"><div className="field"><label className="label">{t('formCheckOut')}</label>
                                <div className="control has-icons-left"><DatePicker selected={modalData.checkOut} onChange={handleModalEndDateChange} selectsEnd startDate={modalData.checkIn} endDate={modalData.checkOut} minDate={modalData.checkIn ? addDays(modalData.checkIn, 1) : new Date()} dateFormat="dd/MM/yyyy" disabled={!modalData.checkIn} excludeDateIntervals={modalConfirmedIntervals} dayClassName={getModalDayClassName} customInput={ <CustomDateInput id={`modal-checkout-date`} placeholder={t('formSelectDate')} className={`input`} /> } /><span className="icon is-left"><FaCalendarAlt /></span></div>
                              </div>
                            </div>
                        </div>
                         <div className="columns">
                            <div className="column"><div className="field"><label className="label">{t('formAdults')}</label><div className="control"><div className="select is-fullwidth"><select name="adults" value={modalData.adults} onChange={handleModalAdultsChange}>{Array.from({ length: 10 }, (_, i) => i + 1).map(num => (<option key={`m-adult-${num}`} value={num}>{num}</option>))}</select></div></div></div></div>
                            <div className="column"><div className="field"><label className="label">{t('formChildren')}</label><div className="control"><div className="select is-fullwidth"><select name="children" value={modalData.children} onChange={handleModalChildrenChange}>{Array.from({ length: 6 }, (_, i) => i).map(num => (<option key={`m-child-${num}`} value={num}>{num}</option>))}</select></div></div></div></div>
                         </div>
                         <div className="field"><label className="label">{t('adminBookingsHeaderStatus')}</label><div className="control"><div className="select is-fullwidth"><select name="status" value={modalData.status} onChange={handleModalInputChange}><option value="Pending">{t('bookingStatusPending')}</option><option value="Confirmed">{t('bookingStatusConfirmed')}</option><option value="Cancelled">{t('bookingStatusCancelled')}</option><option value="Completed">{t('bookingStatusCompleted')}</option></select></div></div></div>
                         <div className="field"><label className="label">{t('formMessage')}</label><div className="control"><textarea className="textarea" name="message" rows="3" value={modalData.message} onChange={handleModalInputChange}></textarea></div></div>
                    </div>
                    )}
                    {!isModalLoading && !editingBooking && <p>{t('adminEditModalNoData')}</p>}
                </section>
                <footer className="modal-card-foot">
                    <button className={`button is-success ${isSavingModal ? 'is-loading' : ''}`} onClick={handleModalSave} disabled={isSavingModal || isModalLoading}>{t('adminEditModalSaveChanges')}</button>
                    <button className="button" onClick={handleCloseModal} disabled={isSavingModal}>{t('adminEditModalCancel')}</button>
                </footer>
            </div>
        </div>
    </div>
  );
}