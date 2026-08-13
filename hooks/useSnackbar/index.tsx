import { useContext } from "react";

import { SnackbarContext } from "@/providers/SnackbarProvider";

const useSnackbar = () => {
    const context = useContext(SnackbarContext);

    if (!context) {
        throw new Error("useSnackbar debe usarse dentro de un SnackbarProvider");
    }

    return context;
};

export default useSnackbar;
