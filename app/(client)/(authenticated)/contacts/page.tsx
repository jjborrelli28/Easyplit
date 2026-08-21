"use client";

import useGetContacts from "@/hooks/data/user/useGetContacts";

import PageContainer from "@/components/PageContainer";
import Spinner from "@/components/Spinner";
import ContactListSection from "./_components/ContactListSection";

const ContactsPage = () => {
  const { data, isPending } = useGetContacts();

  const contacts = [...(data?.contacts ?? []), ...(data?.virtualUsers ?? [])];

  return (
    <PageContainer className="border-h-background !px-0 md:border-r">
      <div className="border-h-background flex flex-1 flex-col border-t px-4 py-8 lg:px-8">
        <div className="flex flex-1 flex-col gap-y-8">
          <h1 className="text-3xl font-bold">Mis contactos</h1>

          <hr className="border-h-background" />

          {isPending ? (
            <div className="flex flex-1 flex-col items-center justify-center">
              <Spinner className="h-12 w-12" />
            </div>
          ) : (
            <ContactListSection contacts={contacts} />
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default ContactsPage;
