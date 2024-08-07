import React, { useState } from "react";
import { useEffect } from "react";
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
import { FaUserTag } from "react-icons/fa";
import { RiAddFill } from "react-icons/ri";
import { FiSearch } from "react-icons/fi";

import * as yup from "yup";
import request from "../../services/ApiClient";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { decodeUser } from "../../services/decode-user";
import { ToastComponent } from "../../components/Toast";
import PageScroll from "../../utils/PageScroll";
import { Pagination, usePagination, PaginationNext, PaginationPage, PaginationPrevious, PaginationContainer, PaginationPageGroup } from "@ajna/pagination";

import DrawerTaggingComponent from "./DrawerTaggingComponent";

const UserRole = () => {
  const [roles, setRoles] = useState([]);
  const [editData, setEditData] = useState([]);
  const [status, setStatus] = useState(true);
  const [search, setSearch] = useState("");
  const toast = useToast();
  const currentUser = decodeUser();

  const [isLoading, setIsLoading] = useState(true);
  const [pageTotal, setPageTotal] = useState(undefined);
  const [disableEdit, setDisableEdit] = useState(false);

  // FETCH API ROLES:
  const fetchRolesApi = async (pageNumber, pageSize, status, search) => {
    const response = await request.get(`Role/GetAllRoleWithPaginationOrig/${status}?PageNumber=${pageNumber}&PageSize=${pageSize}&search=${search}`);

    return response.data;
  };

  //PAGINATION
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

  //STATUS
  const statusHandler = (data) => {
    setStatus(data);
  };

  const changeStatusHandler = (id, isActive) => {
    let routeLabel;
    if (isActive) {
      routeLabel = "InActiveRoles";
    } else {
      routeLabel = "ActivateRoles";
    }

    request
      .put(`/Role/${routeLabel}`, { id: id })
      .then((res) => {
        ToastComponent("Success", "Status updated", "success", toast);
        getRolesHandler();
      })
      .catch((err) => {
        ToastComponent("Error", err.response.data, "error", toast);
      });
    // console.log(routeLabel)
  };

  //SHOW ROLES DATA----
  const getRolesHandler = () => {
    fetchRolesApi(currentPage, pageSize, status, search).then((res) => {
      setIsLoading(false);
      setRoles(res);
      setPageTotal(res.totalCount);
    });
  };

  useEffect(() => {
    getRolesHandler();

    return () => {
      setRoles([]);
    };
  }, [currentPage, pageSize, status, search]);

  // SEARCH
  const searchHandler = (inputValue) => {
    setSearch(inputValue);
  };

  //ADD ROLE HANDLER---
  const addRolesHandler = () => {
    setEditData({
      id: "",
      roleName: "",
      addedBy: currentUser.fullName,
      modifiedBy: "",
    });
    onOpen();
    setDisableEdit(false);
  };

  //EDIT ROLE--
  const editRolesHandler = (role) => {
    setDisableEdit(true);
    setEditData(role);
    onOpen();
  };

  //FOR DRAWER (Drawer / Drawer Tagging)
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDrawerTaggingOpen, onOpen: openDrawerTagging, onClose: closeDrawerTagging } = useDisclosure();

  //MODULE TAGGING
  const [taggingParameter, setTaggingParameter] = useState({
    roleId: "",
    roleName: "",
  });

  const moduleTaggingHandler = (id, roleName) => {
    setTaggingParameter({ roleId: id, roleName: roleName });
    openDrawerTagging();
  };

  useEffect(() => {
    if (search) {
      setCurrentPage(1);
    }
  }, [search]);

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
                  placeholder="Search User Role"
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
            <PageScroll maxHeight="800px">
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
                <Table size="sm" width="full" border="none" boxShadow="md" bg="gray.200" variant="striped" className="inputUpperCase">
                  <Thead bgColor="primary" position="sticky" top={0} zIndex={1}>
                    <Tr>
                      <Th h="40px" color="white" fontSize="11px">
                        ID
                      </Th>
                      <Th h="40px" color="white" fontSize="11px">
                        User Role
                      </Th>
                      <Th h="40px" color="white" fontSize="11px">
                        Added By
                      </Th>
                      <Th h="40px" color="white" fontSize="11px">
                        Date Added
                      </Th>
                      <Th h="40px" color="white" fontSize="11px">
                        Action
                      </Th>
                      <Th h="40px" color="white" fontSize="11px">
                        Access
                      </Th>
                    </Tr>
                  </Thead>

                  <Tbody>
                    {roles.role?.map((rol, i) => (
                      <Tr key={i}>
                        <Td fontSize="xs">{rol.id}</Td>
                        <Td fontSize="xs">{rol.roleName}</Td>
                        <Td fontSize="xs">{rol.addedBy}</Td>
                        <Td fontSize="xs">{rol.dateAdded}</Td>

                        <Td pl={0}>
                          <Flex>
                            <HStack>
                              <Button bg="none" p={0} size="sm" onClick={() => editRolesHandler(rol)}>
                                <AiTwotoneEdit fontSize="15px" />
                              </Button>

                              <Popover>
                                {({ isOpen, onClose }) => (
                                  <>
                                    <PopoverTrigger>
                                      {rol.isActive === true ? (
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
                                            {rol.isActive === true ? (
                                              <Text>Are you sure you want to set this role inactive?</Text>
                                            ) : (
                                              <Text>Are you sure you want to set this role active?</Text>
                                            )}
                                            <Button colorScheme="green" size="sm" onClick={() => changeStatusHandler(rol.id, rol.isActive)}>
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
                        <Td>
                          <Button bg="none" onClick={() => moduleTaggingHandler(rol.id, rol.roleName)}>
                            <FaUserTag />
                          </Button>
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
                fontSize="13px"
                fontWeight="normal"
                colorScheme="blue"
                _hover={{ bg: "blue.400", color: "#fff" }}
                w="auto"
                leftIcon={<RiAddFill fontSize="20px" />}
                onClick={addRolesHandler}
              >
                New
              </Button>

              {/* PROPS */}
              {isOpen && (
                <DrawerComponent isOpen={isOpen} onClose={onClose} fetchRolesApi={fetchRolesApi} getRolesHandler={getRolesHandler} editData={editData} disableEdit={disableEdit} />
              )}

              {isDrawerTaggingOpen && (
                <DrawerTaggingComponent
                  isOpen={isDrawerTaggingOpen}
                  onClose={closeDrawerTagging}
                  onOpen={openDrawerTagging}
                  taggingData={taggingParameter}
                  getRolesHandler={getRolesHandler}
                  editData={editData}
                  disableEdit={disableEdit}
                />
              )}

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

export default UserRole;

const schema = yup.object().shape({
  formData: yup.object().shape({
    id: yup.string(),
    roleName: yup.string().required("User Role is required"),
  }),
});

const currentUser = decodeUser();

const DrawerComponent = (props) => {
  const { isOpen, onClose, getRolesHandler, editData } = props;
  const toast = useToast();

  const [isOpenDrawer, setIsOpenDrawer] = useState(false);

  const onCloseDrawer = () => {
    setIsOpenDrawer(false);
  };

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
        roleName: "",
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
          .post("Role/AddNewRole", data.formData)
          .then((res) => {
            ToastComponent("Success", "New Role created!", "success", toast);
            getRolesHandler();
            onClose();
          })
          .catch((err) => {
            ToastComponent("Error", err.response.data, "error", toast);
            data.formData.id = "";
          });
      } else {
        const res = await request
          .put(`Role/UpdateUserInfo`, data.formData)
          .then((res) => {
            ToastComponent("Success", "Role Updated", "success", toast);
            getRolesHandler();
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
          roleName: editData?.roleName,
          modifiedBy: currentUser.fullName,
        },
        { shouldValidate: true }
      );
    }
  }, [editData]);

  // console.log(watch('formData'))

  return (
    <>
      <Drawer isOpen={isOpen} placement="right" onClose={onCloseDrawer}>
        <DrawerOverlay />
        <form onSubmit={handleSubmit(submitHandler)}>
          <DrawerContent>
            <DrawerHeader borderBottomWidth="1px">Role Form</DrawerHeader>
            {/* <DrawerCloseButton /> */}
            <DrawerBody>
              <Stack spacing="7px">
                <Box>
                  <FormLabel>User Role:</FormLabel>
                  <Input {...register("formData.roleName")} placeholder="Please enter User Role" autoComplete="off" autoFocus />
                  <Text color="red" fontSize="xs">
                    {errors.formData?.roleName?.message}
                  </Text>
                </Box>
              </Stack>
            </DrawerBody>
            <DrawerFooter borderTopWidth="1px">
              <Button variant="outline" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" colorScheme="blue" isDisabled={!isValid}>
                Submit
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </form>
      </Drawer>
    </>
  );
};
