def total(*numbers,**info):
    for k,l in info.items():
        print(f"{k}---{l}")
    t= 0
    for i in numbers:
        t +=i
    return f"Sum is {t}"
print(total(name="Django",Version=5.7))
