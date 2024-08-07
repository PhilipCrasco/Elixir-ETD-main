import React, { useState } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
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
  Image,
} from "@chakra-ui/react";
import { AiTwotoneEdit } from "react-icons/ai";
import { RiAddFill } from "react-icons/ri";

import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import request from "../../services/ApiClient";
import { decodeUser } from "../../services/decode-user";
import { ToastComponent } from "../../components/Toast";

import PageScroll from "../../utils/PageScroll";
import { Pagination, usePagination, PaginationNext, PaginationPage, PaginationPrevious, PaginationContainer, PaginationPageGroup } from "@ajna/pagination";
import { FiSearch } from "react-icons/fi";

const ItemSubCategory = () => {
  const [accountTitle, setAccountTitle] = useState([]);
  const [editData, setEditData] = useState([]);
  const [status, setStatus] = useState(true);
  const [search, setSearch] = useState("");
  const toast = useToast();
  const currentUser = decodeUser();

  const [isLoading, setIsLoading] = useState(true);
  const [pageTotal, setPageTotal] = useState(undefined);
  const [disableEdit, setDisableEdit] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchAccountTitleApi = async (pageNumber, pageSize, status, search) => {
    const response = await request.get(`Material/GetAllAccountTitlesPaginationOrig/${status}?PageNumber=${pageNumber}&PageSize=${pageSize}&search=${search}`);

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
    console.log(isActive);
    if (isActive) {
      routeLabel = "InActiveAccountTitles";
    } else {
      routeLabel = "ActivateAccountTitles";
    }

    request
      .put(`Material/${routeLabel}`, { id: id })
      .then((res) => {
        ToastComponent("Success", "Status updated", "success", toast);
        getAccountTitle();
      })
      .catch((error) => {
        ToastComponent("Status Failed", error.response.data, "warning", toast);
      });
  };

  const getAccountTitle = () => {
    fetchAccountTitleApi(currentPage, pageSize, status, search).then((res) => {
      setIsLoading(false);
      setAccountTitle(res);
      setPageTotal(res.totalCount);
    });
  };

  useEffect(() => {
    getAccountTitle();

    return () => {
      getAccountTitle([]);
    };
  }, [currentPage, pageSize, status, search]);

  const searchHandler = (inputValue) => {
    setSearch(inputValue);
  };

  const addSubCategoryHandler = () => {
    setEditData({
      id: "",
      itemCategoryId: "",
      addedBy: currentUser.fullName,
      modifiedBy: "",
    });
    onOpen();
    setDisableEdit(false);
  };

  const editSubCategoryHandler = (accTitle) => {
    setDisableEdit(true);
    setEditData(accTitle);
    onOpen();
  };

  return (
    <Flex color="fontColor" h="full" w="full" flexDirection="column" p={2} bg="form">
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
                  placeholder="Search"
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
            <PageScroll maxHeight="750px">
              <Text textAlign="center" bgColor="primary" color="white" fontSize="14px">
                List of Account Title (Per Item)
              </Text>

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
                <Table className="inputUpperCase" size="sm" width="full" border="none" boxShadow="md" bg="gray.200" variant="striped">
                  <Thead bg="primary" position="sticky" top={0} zIndex={1}>
                    <Tr>
                      <Th h="40px" color="white" fontSize="10px">
                        ID
                      </Th>
                      <Th h="40px" color="white" fontSize="10px">
                        Category Name
                      </Th>
                      <Th h="40px" color="white" fontSize="10px">
                        Account Title
                      </Th>
                      <Th h="40px" color="white" fontSize="10px">
                        Added By
                      </Th>
                      <Th h="40px" color="white" fontSize="10px">
                        Date Added
                      </Th>
                      <Th h="40px" color="white" fontSize="10px">
                        Action
                      </Th>
                    </Tr>
                  </Thead>

                  <Tbody>
                    {accountTitle?.category?.map((accTitle, i) => (
                      <Tr key={i}>
                        <Td fontSize="xs">{accTitle.id}</Td>
                        <Td fontSize="xs">{accTitle.itemCategoryName}</Td>
                        <Td fontSize="xs">{accTitle.accountPName}</Td>
                        <Td fontSize="xs">{accTitle.addedBy}</Td>
                        <Td fontSize="xs">{accTitle.dateAdded}</Td>

                        <Td pl={0}>
                          <Flex>
                            <HStack>
                              <Button bg="none" size="sm" onClick={() => editSubCategoryHandler(accTitle)}>
                                <AiTwotoneEdit fontSize="15px" />
                              </Button>

                              <Popover>
                                {({ onClose }) => (
                                  <>
                                    <PopoverTrigger>
                                      {accTitle.isActive === true ? (
                                        <Button bg="none" size="md" p={0}>
                                          <Image boxSize="20px" src="/images/turnon.png" title="active" />
                                        </Button>
                                      ) : (
                                        <Button bg="none" size="md" p={0}>
                                          <Image boxSize="20px" src="/images/turnoff.png" title="inactive" />
                                        </Button>
                                      )}
                                    </PopoverTrigger>
                                    <Portal>
                                      <PopoverContent bg="primary" color="#fff">
                                        <PopoverArrow bg="primary" />
                                        <PopoverCloseButton />
                                        <PopoverHeader>Confirmation!</PopoverHeader>
                                        <PopoverBody>
                                          <VStack onClick={onClose}>
                                            {accTitle.isActive === true ? (
                                              <Text>Are you sure you want to set this Item Category inactive?</Text>
                                            ) : (
                                              <Text>Are you sure you want to set this Item Category active?</Text>
                                            )}
                                            <Button colorScheme="green" size="sm" onClick={() => changeStatusHandler(accTitle.id, accTitle.isActive)}>
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

            <Flex justifyContent="space-between" mt={3}>
              <Button
                size="sm"
                colorScheme="blue"
                fontSize="13px"
                fontWeight="normal"
                _hover={{ bg: "blue.400", color: "#fff" }}
                w="auto"
                leftIcon={<RiAddFill fontSize="20px" />}
                onClick={addSubCategoryHandler}
              >
                New
              </Button>

              {isOpen && <DrawerComponent isOpen={isOpen} onClose={onClose} fetchAccountTitleApi={fetchAccountTitleApi} getAccountTitle={getAccountTitle} editData={editData} />}

              <Stack>
                <Pagination pagesCount={pagesCount} currentPage={currentPage} onPageChange={handlePageChange}>
                  <PaginationContainer>
                    <PaginationPrevious bg="primary" color="white" p={1} _hover={{ bg: "btnColor", color: "white" }}>
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
                        />
                      ))}
                    </PaginationPageGroup>
                    <HStack>
                      <PaginationNext bg="primary" color="white" p={1} _hover={{ bg: "btnColor", color: "white" }}>
                        {">>"}
                      </PaginationNext>
                      <Select onChange={handlePageSizeChange} variant="outline" fontSize="md">
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

export default ItemSubCategory;

const schema = yup.object().shape({
  formData: yup.object().shape({
    id: yup.string(),
    itemCategoryId: yup.string().uppercase().required("Item Category name is required"),
    accountPName: yup.string().uppercase().required("Sub Category name is required"),
    addedBy: yup.string().uppercase(),
  }),
});

const currentUser = decodeUser();

const DrawerComponent = (props) => {
  const { isOpen, onClose, getAccountTitle, editData } = props;
  const [category, setCategory] = useState([]);
  const toast = useToast();
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);

  const onCloseDrawer = () => {
    setIsOpenDrawer(false);
  };

  const fetchCategory = async () => {
    try {
      const res = await request.get("Material/GetAllActiveItemCategory");
      setCategory(res.data);
    } catch (error) {}
  };

  useEffect(() => {
    try {
      fetchCategory();
    } catch (error) {}
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      formData: {
        id: "",
        itemCategoryId: "",
        accountPName: "",
        addedBy: currentUser?.fullName,
        modifiedBy: "",
      },
    },
  });

  const submitHandler = async (data) => {
    try {
      if (data.formData.id === "") {
        delete data.formData["id"];
        const res = await request
          .post("Material/AddNewAccountTitles", data.formData)
          .then((res) => {
            ToastComponent("Success", "New Account Title per item created!", "success", toast);
            getAccountTitle();
            onClose();
          })
          .catch((err) => {
            ToastComponent("Error", err.response.data, "error", toast);
            data.formData.id = "";
          });
      } else {
        const res = await request
          .put(`Material/UpdateAccountTitles`, data.formData)
          .then((res) => {
            ToastComponent("Success", "Account title per item Updated", "success", toast);
            getAccountTitle();
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
          itemCategoryId: editData?.itemCategoryId,
          accountPName: editData?.accountPName,
          modifiedBy: currentUser.fullName,
        },
        { shouldValidate: true }
      );
    }
    console.log(editData);
  }, [editData]);

  return (
    <>
      <Drawer isOpen={isOpen} placement="right" onClose={onCloseDrawer}>
        <DrawerOverlay />
        <form onSubmit={handleSubmit(submitHandler)}>
          <DrawerContent>
            <DrawerHeader borderBottomWidth="1px">Account Title Form</DrawerHeader>

            <DrawerBody>
              <Stack spacing="7px">
                <Box>
                  <FormLabel>Category Name:</FormLabel>
                  {category.length > 0 ? (
                    <Select color="black" {...register("formData.itemCategoryId")} placeholder="Select Category" fontSize="md" autoFocus>
                      {category.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.itemCategoryName}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    "loading"
                  )}
                  <Text color="red" fontSize="xs">
                    {errors.formData?.itemCategoryId?.message}
                  </Text>
                </Box>

                <Box>
                  <FormLabel>Account Title (Per Item):</FormLabel>
                  <Input {...register("formData.accountPName")} autoComplete="off" autoFocus />
                  <Text color="red" fontSize="xs">
                    {errors.formData?.accountPName?.message}
                  </Text>
                </Box>
              </Stack>
            </DrawerBody>

            <DrawerFooter borderTopWidth="1px">
              <Button variant="outline" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" isDisabled={!isValid} colorScheme="blue">
                Submit
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </form>
      </Drawer>
    </>
  );
};
