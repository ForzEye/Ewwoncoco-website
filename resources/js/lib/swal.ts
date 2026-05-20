import Swal from 'sweetalert2';

// Create a custom styled SweetAlert2 instance matching Ewwon Coco's brand design system
export const swal = Swal.mixin({
    customClass: {
        confirmButton: 'bg-[#00C48C] hover:bg-[#00a878] text-white px-6 py-2.5 rounded-lg font-poppins font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00C48C]/50 mx-2 transition-all',
        cancelButton: 'bg-[#E8E4DD] hover:bg-[#dcd6cc] text-[#4A4A4A] px-6 py-2.5 rounded-lg font-poppins font-semibold focus:outline-none focus:ring-2 focus:ring-gray-300 mx-2 transition-all',
        popup: 'rounded-2xl border border-[#E8E4DD] shadow-xl p-6 bg-white',
        title: 'font-poppins font-black text-[#1A1A1A] text-xl',
        htmlContainer: 'font-inter text-[#4A4A4A] text-sm leading-relaxed mt-2',
    },
    buttonsStyling: false,
});

// Premium Toast mixin
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    },
    customClass: {
        popup: 'rounded-xl border border-[#E8E4DD] shadow-lg bg-white p-3 font-poppins font-semibold text-sm',
    }
});

export const toastSuccess = (message: string) => {
    Toast.fire({
        icon: 'success',
        title: message,
        iconColor: '#00C48C',
    });
};

export const toastError = (message: string) => {
    Toast.fire({
        icon: 'error',
        title: message,
        iconColor: '#FF4D4D',
    });
};

export const toastWarning = (message: string) => {
    Toast.fire({
        icon: 'warning',
        title: message,
        iconColor: '#FF8A00',
    });
};

export const alertSuccess = (title: string, text: string) => {
    return swal.fire({
        icon: 'success',
        title,
        text,
        iconColor: '#00C48C',
    });
};

export const alertError = (title: string, text: string) => {
    return swal.fire({
        icon: 'error',
        title,
        text,
        iconColor: '#FF4D4D',
    });
};

export const alertWarning = (title: string, text: string) => {
    return swal.fire({
        icon: 'warning',
        title,
        text,
        iconColor: '#FF8A00',
    });
};

export const confirmAction = (title: string, text: string, confirmText: string = 'Ya, Lanjutkan') => {
    return swal.fire({
        title,
        text,
        icon: 'warning',
        iconColor: '#FF8A00',
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: 'Batal',
        reverseButtons: true,
    });
};
