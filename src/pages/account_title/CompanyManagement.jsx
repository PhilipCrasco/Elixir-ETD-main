import React, { useState } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Skeleton,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  useToast,
  Thead,
  Tr,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  VStack,
  Portal,
} from "@chakra-ui/react";
import { AiTwotoneEdit } from "react-icons/ai";
import { GiChoice } from "react-icons/gi";
import { FiSearch } from "react-icons/fi";
import { RiAddFill } from "react-icons/ri";

import * as yup from "yup";
import request from "../../services/ApiClient";
import { yupResolver } from "@hookform/resolvers/yup";
import { decodeUser } from "../../services/decode-user";
import { ToastComponent } from "../../components/Toast";
import PageScroll from "../../utils/PageScroll";
import { Pagination, usePagination, PaginationNext, PaginationPage, PaginationPrevious, PaginationContainer, PaginationPageGroup } from "@ajna/pagination";

const CompanyManagement = () => {
  const [company, setCompany] = useState([]);
  const [editData, setEditData] = useState([]);
  const [status, setStatus] = useState(true);
  const [search, setSearch] = useState("");
  const toast = useToast();
  const currentUser = decodeUser();

  const [isLoading, setIsLoading] = useState(true);
  const [pageTotal, setPageTotal] = useState(undefined);
  const [disableEdit, setDisableEdit] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchCompanyApi = async (pageNumber, pageSize, status, search) => {
    const response = await request.get(`Company/GetAllCompanyWithPaginationOrig/${status}?PageNumber=${pageNumber}&PageSize=${pageSize}&search=${search}`);

    return response.data;
  };

  const outerLimit = 2;
  const innerLimit = 2;
  const { currentPage, setCurrentPage, pagesCount, pages, setPageSize, pageSize } = usePagination({
    total: pageTotal,
    limits: {
      outer: outerLimit,
      inner: innerLimit,
    },
    initialState: { currentPage: 1, pageSize: 5 },
  });

  const handlePageChange = (nextPage) => {
    setCurrentPage(nextPage);
  };

  const handlePageSizeChange = (e) => {
    const pageSize = Number(e.target.value);
    setPageSize(pageSize);
  };

  const statusHandler = (data) => {
    setStatus(data);
  };

  const changeStatusHandler = (id, isActive) => {
    let routeLabel;
    if (isActive) {
      routeLabel = "InActiveCompany";
    } else {
      routeLabel = "ActivateCompany";
    }

    request
      .put(`Company/${routeLabel}`, { id: id })
      .then((res) => {
        ToastComponent("Success", "Status updated", "success", toast);
        getCompanyHandler();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getCompanyHandler = () => {
    fetchCompanyApi(currentPage, pageSize, status, search).then((res) => {
      setIsLoading(false);
      setCompany(res);
      setPageTotal(res.totalCount);
    });
  };

  useEffect(() => {
    getCompanyHandler();

    return () => {
      setCompany([]);
    };
  }, [currentPage, pageSize, status, search]);

  const searchHandler = (inputValue) => {
    setSearch(inputValue);
  };

  const addCompanyHandler = () => {
    setEditData({
      id: "",
      companyCode: "",
      companyName: "",
      addedBy: currentUser.userName,
      modifiedBy: "",
    });
    onOpen();
    setDisableEdit(false);
  };

  const editCompanyHandler = (company) => {
    setDisableEdit(true);
    setEditData(company);
    onOpen();
  };

  return (
    <Flex color="fontColor" h="full" w="full" flexDirection="column" p={2} bg="form" boxShadow="md">
      <Flex p={2} w="full">
        <Flex flexDirection="column" gap={1} w="full">
          <Flex justifyContent="space-between" alignItems="center">
            <HStack w="25%" mt={3}>
              <InputGroup size="sm">
                <InputLeftElement pointerEvents="none" children={<FiSearch bg="black" fontSize="18px" />} />
                <Input
                  borderRadius="lg"
                  fontSize="13px"
                  type="text"
                  border="1px"
                  bg="#E9EBEC"
                  placeholder="Search Company Name"
                  borderColor="gray.400"
                  _hover={{ borderColor: "gray.400" }}
                  onChange={(e) => searchHandler(e.target.value)}
                />
              </InputGroup>
            </HStack>

            <HStack flexDirection="row">
              <Text fontSize="12px">STATUS:</Text>
              <Select fontSize="12px" onChange={(e) => statusHandler(e.target.value)}>
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
              </Select>
            </HStack>
          </Flex>

          <Flex w="full" flexDirection="column" gap={2}>
            <PageScroll maxHeight="470px">
              {isLoading ? (
                <Stack width="full">
                  <Skeleton height="20px" />
                  <Skeleton height="20px" />
                  <Skeleton height="20px" />
                  <Skeleton height="20px" />
                  <Skeleton height="20px" />
                  <Skeleton height="20px" />
                </Stack>
              ) : (
                <Table size="sm" width="full" border="none" boxShadow="md" bg="gray.200" variant="striped">
                  <Thead bg="secondary">
                    <Tr fontSize="15px">
                      <Th color="#D6D6D6" fontSize="10px">
                        ID
                      </Th>
                      <Th color="#D6D6D6" fontSize="10px">
                        Company Code
                      </Th>
                      <Th color="#D6D6D6" fontSize="10px">
                        Company Name
                      </Th>
                      <Th color="#D6D6D6" fontSize="10px">
                        Added By
                      </Th>
                      <Th color="#D6D6D6" fontSize="10px">
                        Date Added
                      </Th>
                      <Th color="#D6D6D6" fontSize="10px">
                        Action
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {company?.company?.map((comp, i) => (
                      <Tr key={i}>
                        <Td fontSize="11px">{comp.id}</Td>
                        <Td fontSize="11px">{comp.companyCode}</Td>
                        <Td fontSize="11px">{comp.companyName}</Td>
                        <Td fontSize="11px">{comp.addedBy}</Td>
                        <Td fontSize="11px">{comp.dateAdded}</Td>

                        <Td pl={0}>
                          <Flex>
                            <HStack>
                              <Button bg="none" onClick={() => editCompanyHandler(comp)}>
                                <AiTwotoneEdit />
                              </Button>

                              <Popover>
                                {({ onClose }) => (
                                  <>
                                    <PopoverTrigger>
                                      <Button p={0} bg="none">
                                        <GiChoice />
                                      </Button>
                                    </PopoverTrigger>
                                    <Portal>
                                      <PopoverContent bg="primary" color="#fff">
                                        <PopoverArrow bg="primary" />
                                        <PopoverCloseButton />
                                        <PopoverHeader>Confirmation!</PopoverHeader>
                                        <PopoverBody>
                                          <VStack onClick={onClose}>
                                            {comp.isActive === true ? (
                                              <Text>Are you sure you want to set this company inactive?</Text>
                                            ) : (
                                              <Text>Are you sure you want to set this company active?</Text>
                                            )}
                                            <Button colorScheme="green" size="sm" onClick={() => changeStatusHandler(comp.id, comp.isActive)}>
                                              Yes
                                            </Button>
                                          </VStack>
                                        </PopoverBody>
                                      </PopoverContent>
                                    </Portal>
                                  </>
                                )}
                              </Popover>
                            </HStack>
                          </Flex>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </PageScroll>

            <Flex justifyContent="space-between">
              <Button
                size="sm"
                colorScheme="blue"
                fontSize="13px"
                fontWeight="normal"
                _hover={{ bg: "blue.400", color: "#fff" }}
                w="auto"
                leftIcon={<RiAddFill fontSize="20px" />}
                borderRadius="none"
                onClick={addCompanyHandler}
              >
                New Company
              </Button>

              {isOpen && <DrawerComponent isOpen={isOpen} onClose={onClose} getCompanyHandler={getCompanyHandler} editData={editData} disableEdit={disableEdit} />}

              <Stack>
                <Pagination pagesCount={pagesCount} currentPage={currentPage} onPageChange={handlePageChange}>
                  <PaginationContainer>
                    <PaginationPrevious bg="primary" color="white" p={1} _hover={{ bg: "btnColor", color: "white" }} size="sm">
                      {"<<"}
                    </PaginationPrevious>
                    <PaginationPageGroup ml={1} mr={1}>
                      {pages.map((page) => (
                        <PaginationPage
                          _hover={{ bg: "btnColor", color: "white" }}
                          _focus={{ bg: "btnColor" }}
                          p={3}
                          bg="primary"
                          color="white"
                          key={`pagination_page_${page}`}
                          page={page}
                          size="sm"
                        />
                      ))}
                    </PaginationPageGroup>
                    <HStack>
                      <PaginationNext bg="primary" color="white" p={1} _hover={{ bg: "btnColor", color: "white" }} size="sm" mb={2}>
                        {">>"}
                      </PaginationNext>
                      <Select
                        onChange={handlePageSizeChange}
                        bg="#FFFFFF"
                        // size="sm"
                        mb={2}
                        variant="outline"
                      >
                        <option value={Number(5)}>5</option>
                        <option value={Number(10)}>10</option>
                        <option value={Number(25)}>25</option>
                        <option value={Number(50)}>50</option>
                      </Select>
                    </HStack>
                  </PaginationContainer>
                </Pagination>
              </Stack>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default CompanyManagement;

const schema = yup.object().shape({
  formData: yup.object().shape({
    id: yup.string(),
    companyCode: yup.string().required("Company Code is required"),
    companyName: yup.string().required("Company Name is required"),
  }),
});

const currentUser = decodeUser();

const DrawerComponent = (props) => {
  const { isOpen, onClose, getCompanyHandler, editData, disableEdit } = props;
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      formData: {
        id: "",
        companyCode: "",
        companyName: "",
        addedBy: currentUser?.userName,
        modifiedBy: "",
      },
    },
  });

  const submitHandler = async (data) => {
    try {
      if (data.formData.id === "") {
        delete data.formData["id"];
        const res = await request
          .post("Company/AddNewCompany", data.formData)
          .then((res) => {
            ToastComponent("Success", "New company created!", "success", toast);
            getCompanyHandler();
            onClose();
          })
          .catch((err) => {
            ToastComponent("Error", err.response.data, "error", toast);
            data.formData.id = "";
          });
      } else {
        const res = await request
          .put(`Company/UpdateCompany`, data.formData)
          .then((res) => {
            ToastComponent("Success", "Company Updated", "success", toast);
            getCompanyHandler();
            onClose(onClose);
          })
          .catch((error) => {
            ToastComponent("Update Failed", error.response.data, "warning", toast);
          });
      }
    } catch (err) {}
  };

  useEffect(() => {
    if (editData.id) {
      setValue(
        "formData",
        {
          id: editData.id,
          companyCode: editData?.companyCode,
          companyName: editData?.companyName,
          modifiedBy: currentUser.userName,
        },
        { shouldValidate: true }
      );
    }
  }, [editData]);

  return (
    <>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <form onSubmit={handleSubmit(submitHandler)}>
          <DrawerContent>
            <DrawerHeader borderBottomWidth="1px">Company Form</DrawerHeader>
            <DrawerCloseButton />
            <DrawerBody>
              <Stack spacing="7px">
                <Box>
                  <FormLabel>Company Code:</FormLabel>
                  <Input
                    {...register("formData.companyCode")}
                    placeholder="Please enter Company Code"
                    autoComplete="off"
                    autoFocus
                    disabled={disableEdit}
                    readOnly={disableEdit}
                    _disabled={{ color: "black" }}
                    bgColor={disableEdit && "gray.300"}
                  />
                  <Text color="red" fontSize="xs">
                    {errors.formData?.companyCode?.message}
                  </Text>
                </Box>

                <Box>
                  <FormLabel>Company Name:</FormLabel>
                  <Input {...register("formData.companyName")} placeholder="Please enter Company Name" autoComplete="off" />
                  <Text color="red" fontSize="xs">
                    {errors.formData?.companyName?.message}
                  </Text>
                </Box>
              </Stack>
            </DrawerBody>

            <DrawerFooter borderTopWidth="1px">
              <Button variant="outline" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" colorScheme="blue" disabled={!isValid}>
                Submit
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </form>
      </Drawer>
    </>
  );
};
