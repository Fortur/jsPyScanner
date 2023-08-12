import library as library
import sys

funcParam1 = input()
funcName = sys.argv[1]


if funcName == 'lib_register_result':
    funcParam2 = sys.argv[2]
    res = library.lib_register_result(funcParam1, funcParam2)
    print(res)
    sys.stdout.flush()
elif funcName == 'lib_process_image':
    res = library.lib_process_image(funcParam1)
    print(res)
    sys.stdout.flush()
