# from library import lib_register_result, lib_process_image
import library as library
import sys

funcName = sys.argv[1]
funcParam1 = sys.argv[2]

if funcName == 'lib_register_result' and len(sys.argv) == 4:
    funcParam2 = sys.argv[3]
    res = library.lib_register_result(funcParam1, funcParam2)
    print(res)
elif funcName == 'lib_process_image':
    res = library.lib_process_image(funcParam1)
    print(res)


# print(sys.argv[1])
sys.stdout.flush()
